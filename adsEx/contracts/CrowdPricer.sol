contract CrowdPricer {
  struct Proposal {
      address proposer;
      uint proposedPrice;
      uint refund;
  }

  address public initiator;
  string public itemDescription;
  uint public minNumProposals;

  uint public initiatorDeposit;
  uint public bounty;
  uint public maxNumProposals;  // calculated based on initiatorDeposit

  // set these high to attract more serious players
  uint public admissionDeposit; // this prevent proposers to use a lot of accounts
  uint public confidenceBet;  // this prevent proposers to propose undeliberately

  uint public tolerance;

  Proposal[] public proposals;
  mapping(address => uint) public proposerRecord;

  bool public finalized;
  uint public finalPrice;

  function CrowdPricer(
    string _itemDescription,
    uint _admissionDeposit,
    uint _confidenceBet,
    uint _bounty,
    uint _tolerance,
    uint _minNumProposals
    ) {
      if (msg.value < _minNumProposals * (_admissionDeposit + _confidenceBet) + _bounty) {
        throw;
      }

      initiator = msg.sender;
      initiatorDeposit = msg.value - _bounty;
      itemDescription = _itemDescription;
      admissionDeposit = _admissionDeposit;
      confidenceBet = _confidenceBet;
      bounty = _bounty;
      tolerance = _tolerance;
      minNumProposals = _minNumProposals;
      maxNumProposals = initiatorDeposit / (_admissionDeposit + _confidenceBet);
    }

    modifier isNotYetFinalized() {
        if (finalized) throw;
        _
    }

    modifier isFinalized() {
        if (!finalized) throw;
        _
    }

    modifier onlyInitiator() {
        if (msg.sender != initiator) throw;
        _
    }

    modifier onlyProposer() {
        if (msg.sender == initiator) throw;
        _
    }

    modifier isFinalizable() {
        if (proposals.length < minNumProposals) throw;
        _
    }

    modifier hasNoProposalYet() {
      if (proposals.length > 0) throw;
      _
    }

    modifier canTakeMoreProposals() {
        if (proposals.length >= maxNumProposals) throw;
        _
    }

    modifier hasEnoughProposingFund() {
        if (msg.value < admissionDeposit + confidenceBet) throw;
        _
    }

    modifier isNewProposer() {
      if (proposerRecord[msg.sender] > 0) throw;
      _
    }

    event Aborted();
    event Revealed();

    function abort()
        isNotYetFinalized
        onlyInitiator
        hasNoProposalYet
    {
        finalized = true;
        Aborted();
        if (!initiator.send(this.balance)) {
          throw;
        }
        initiatorDeposit = 0;
        bounty = 0;
    }

    function propose(uint price)
      isNotYetFinalized
      onlyProposer
      isNewProposer
      canTakeMoreProposals
      hasEnoughProposingFund
    {
      proposals.push(Proposal({
        proposer: msg.sender,
        proposedPrice: price,
        refund: admissionDeposit
      }));

      proposerRecord[msg.sender] = proposals.length;

      // refund extra fund
      if (!msg.sender.send(msg.value - admissionDeposit - confidenceBet)) {
        throw;
      }
    }

    function reveal()
      isNotYetFinalized
    {
      // if there are enough proposals, anyone can reveal
      // if there's at least one proposal but less than minNumProposals, only initiator can reveal
      if (proposals.length == 0 || proposals.length < minNumProposals && msg.sender != initiator) {
        throw;
      }

      finalized = true;
      Revealed();

      sort();

      // handle edge cases
      if (proposals.length == 1) {
        proposals[0].refund += confidenceBet + bounty;
        finalPrice = proposals[0].proposedPrice;
      } else if (proposals.length == 2) {
        for (uint i=0; i<proposals.length; i++) {
            proposals[i].refund += confidenceBet + bounty / 2;
        }
        finalPrice = (proposals[0].proposedPrice + proposals[1].proposedPrice) / 2;
      } else {
        var totalCompensation = bounty;
        uint countWinningProposers = 0;
        finalPrice = proposals[proposals.length/2].proposedPrice;

        for (uint j=0; j<proposals.length; j++) {
          if (j < proposals.length/2 && finalPrice - proposals[j].proposedPrice > tolerance
              || j > proposals.length/2 && proposals[j].proposedPrice - finalPrice > tolerance) {
            totalCompensation += confidenceBet;
          } else {
            proposals[j].refund += confidenceBet; //get his own bet back
            countWinningProposers ++;
          }
        }

        var avgCompensation = totalCompensation / countWinningProposers;

        for (uint k=0; k<proposals.length; k++) {
          if (proposals[k].refund == admissionDeposit + confidenceBet) {  //which means it's a winner
            proposals[k].refund += avgCompensation;
          }
        }
      }
    }

    function claimRefund()
      isFinalized
    {
      if (msg.sender == initiator && initiatorDeposit > 0) {
        if (!initiator.send(initiatorDeposit)) {
          throw;
        }
        initiatorDeposit = 0;
      }
      if (msg.sender != initiator && proposerRecord[msg.sender] > 0) {
        // avoid reentrance
        if (!msg.sender.send(proposals[proposerRecord[msg.sender]-1].refund)) {
          throw;
        }
        proposals[proposerRecord[msg.sender]-1].refund = 0;
        proposerRecord[msg.sender] = 0;
      }
    }

    function sort() internal {
      if (proposals.length == 0)
        return;
      quickSort(proposals, 0, proposals.length - 1);
    }

    function quickSort(Proposal[] storage arr, uint left, uint right) internal {
      uint i = left;
      uint j = right;
      uint pivot = arr[left + (right - left) / 2].proposedPrice;
      while (i <= j) {
        while (arr[i].proposedPrice < pivot) i++;
        while (pivot < arr[j].proposedPrice) j--;
        if (i <= j) {
          (arr[i], arr[j]) = (arr[j], arr[i]);
          proposerRecord[arr[i].proposer] = i+1;
          proposerRecord[arr[j].proposer] = j+1;
          i++;
          j--;
        }
      }
      if (left < j)
      quickSort(arr, left, j);
      if (i < right)
      quickSort(arr, i, right);
    }
}
