pragma solidity ^0.4.2;

contract AdExchange {
  uint public tov = 144; // term of validity; assuming 10min a block, that's 24hours
  event debugging(address sender, string message, uint index);

  //========================================================= debugging function
  function bytes32ToString (bytes32 data) returns (string) {
      bytes memory bytesString = new bytes(32);
      for (uint j=0; j<32; j++) {
          byte char = byte(bytes32(uint(data) * 2 ** (8 * j)));
          if (char != 0) {
              bytesString[j] = char;
          }
      }
      return string(bytesString);
  }

  function getAllAdvertise(){
    for(uint i = 0; i < advertiserList.length;i++){
      debugging(advertiserList[i].publicKey,"hah", i);
    }
  }
  function getAllPublisher(){
    for(uint i = 0; i < publisherList.length;i++){
      debugging(publisherList[i],"hah",i);
    }
  }
  function getDepositInfo(address advertiser){
    DepositEntry[] entryList = depositTable[advertiser];

    for(uint i = 0; i<entryList.length; i++) {
      debugging(entryList[i].recipient,"deposit info",entryList[i].amount);
    }
  }


  // ======================================================== advertiser
  struct Advertiser {
    address publicKey;
    string callback;
  }

  struct DepositEntry {
    address recipient;
    uint amount;
  }

  struct WithdrawHistoryEntry {
    address advertiser;
    address publisher;
    uint withDrawAmount;
    string eventId;
    uint blockHeightAtBid;
    uint bidId;
    bool exist;
  }

  Advertiser[] public advertiserList;
  mapping(address => string) public advertiserCallbacks;
  mapping(address => DepositEntry[]) depositTable;
  mapping(address => mapping(string => WithdrawHistoryEntry)) withdrawHistoryTable;

  modifier isNewAdvertiser() {
    if (bytes(advertiserCallbacks[msg.sender]).length > 0) throw;
    _;
  }

  modifier isRegisteredAdvertiser() {
    if (bytes(advertiserCallbacks[msg.sender]).length == 0) throw;
    _;
  }

  modifier isCallbackSigValid(string callback, uint8 v, bytes32 r, bytes32 s) {
    if (!verifySignature(msg.sender, sha3(callback), v, r, s)) throw;
    _;
  }

  function registerAdvertiser(string callback, uint8 v, bytes32 r, bytes32 s)
    isNewAdvertiser
    isCallbackSigValid(callback, v, r, s)
  {
    // create new channels for new advertiser to publishers
    for(uint i = 0; i<publisherList.length; i++){
      depositTable[msg.sender].push(DepositEntry({
        recipient: publisherList[i],
        amount: 0
      }));
    }
    advertiserList.push(Advertiser({
      publicKey: msg.sender,
      callback: callback
    }));
    advertiserCallbacks[msg.sender] = callback;
    debugging(msg.sender,callback,0);
  }

  function deposit()
    payable
    isRegisteredAdvertiser
  {
    DepositEntry[] entryList = depositTable[msg.sender];

    if(entryList.length == 0) throw;

    uint totalDepositAmount = 0;
    for(uint i = 0; i<entryList.length; i++) {
      uint amountEach = msg.value/entryList.length * publisherWeighting[i];
      entryList[i] = DepositEntry({
        recipient: entryList[i].recipient,
        amount: entryList[i].amount + amountEach
      });
      totalDepositAmount += amountEach;
    }

    depositTable[msg.sender] = entryList;
    //return the change individable
    if (!msg.sender.send(msg.value-totalDepositAmount)) {
      throw;
    }
  }

  function findAvailableAdvertisersByPublisher(address publisher) constant returns (address[]) {
    address[] memory availableAdvertisers = new address[](advertiserList.length);
    uint counter = 0;
    for (uint i=0; i<advertiserList.length; i++) {
      DepositEntry[] depositList = depositTable[advertiserList[i].publicKey];
      for (uint j=0; j<depositList.length; j++) {
        if (depositList[j].recipient == publisher && depositList[j].amount > 0) {
          availableAdvertisers[counter] = advertiserList[i].publicKey;
          counter++;
          break;
        }
      }
    }
    return availableAdvertisers;
  }

  function getCallbackByAdvertiser(address advertiser) constant returns (string) {
    return advertiserCallbacks[advertiser];
  }

  // ======================================================== publisher
  address[] public publisherList;
  mapping(address => bool) public publisherDedup;
  uint[] public publisherWeighting;

  modifier isNewPublisher(){
    if(publisherDedup[msg.sender]) {
        //debugging(msg.sender, "deuplicate publisher");
        throw;
    }
    _;
  }

  modifier isRegisteredPublisher(){
    if(!publisherDedup[msg.sender]) throw;
    _;
  }

  function registerPublisher()
    isNewPublisher
  {

    // create new channels for new publisher to advertisers
    for(uint i = 0; i<advertiserList.length; i++){
      depositTable[advertiserList[i].publicKey].push(DepositEntry({
        recipient: msg.sender,
        amount: 0
      }));
    }
    publisherList.push(msg.sender);
    publisherDedup[msg.sender] = true;
    publisherWeighting.push(1);
  }

  function isPublisherExist(address publisher) constant returns (bool) {
    return publisherDedup[publisher];
  }

  function getDeposit() constant returns(address[],uint[]) {
    address publickey = msg.sender;
    address[] memory adds = new address[](advertiserList.length);
  //  adds[0] = entryRow[0].recipient;
    uint[] memory deposits = new uint[](advertiserList.length);
  //  deposits[0] = 0;
    DepositEntry[] entryRow = depositTable[publickey];
    for(uint i = 0; i<advertiserList.length; i++){
      adds[i] = entryRow[i].recipient;
      deposits[i] = entryRow[i].amount;
    }
    return (adds, deposits);
  }

  function verifySignature(address publickey, bytes32 hashedData, uint8 v, bytes32 r, bytes32 s) internal returns (bool) {
    return publickey == ecrecover(hashedData,v,r,s);
  }

  //publisher withdraw payment
  event Withdrawn();

  function withdraw(
    address payerKey,
    address receiverKey,
    string eventId,
    uint blockHeightAtBid,
    uint bidId,
    string ads,
    uint amount,
    uint8 v,
    bytes32 r,
    bytes32 s)
    isRegisteredPublisher
  {
    if (blockHeightAtBid + tov >= block.number) throw;
    if (receiverKey != msg.sender) throw;
    if (withdrawHistoryTable[receiverKey][eventId].exist) throw;
    if (!verifySignature(payerKey, sha3(receiverKey, eventId, blockHeightAtBid, bidId, ads, amount), v,r,s)) throw;

    //Verify success send money and make record consistence
    if (!receiverKey.send(amount)) {
      throw;
    }

    Withdrawn();

    //change deposit table
    DepositEntry[] entryRows = depositTable[payerKey];
    for(uint i = 0; i<entryRows.length; i++){
      if(entryRows[i].recipient == receiverKey){
        entryRows[i] = DepositEntry({
          recipient: receiverKey,
          amount: entryRows[i].amount - amount
        });
      }
    }
    depositTable[payerKey] = entryRows;

    //add this transaction to history table
    withdrawHistoryTable[receiverKey][eventId] = WithdrawHistoryEntry({
      advertiser: payerKey,
      publisher: receiverKey,
      withDrawAmount: amount,
      blockHeightAtBid: blockHeightAtBid,
      bidId:bidId,
      eventId: eventId,
      exist: true
    });
  }



  function DDA() {
    //TODO -- should called by advertiser to adjust deposit balancing
  }

}
