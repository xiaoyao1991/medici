pragma solidity ^0.4.2;


// Proof of Existence contract, version 2
contract  AdExchange {
  address public debugAdd = 0x0;
  uint public debug = 1 ;
  address public alice = 0x1;
  address public bob = 0x2;
  uint public testint = 10002;
  string public test = "haha";


  uint public withDrawDeadline = 50;
  //advertiser side properties
  struct DepositEntry{
    address recipient;
    uint amount;
  }

  address[] public advertiserList;
  mapping(address => DepositEntry[]) public depositTable;
  struct WithdrawHistoryEntryRow{
    address advertiser;
    address publisher;
    uint withDrawAmount;
    uint blockHightAtBid;
    uint bidID;
  }
  WithdrawHistoryEntryRow[] public WithdrawHistoryTable;



  //publisher side properties
  address[] public publisherList;
  mapping(address => bool) public publisherDedup;
  uint[] public publisherWeighting;

  modifier isNewPublisher(){
    if(publisherDedup[publickey]) throw;
    _
  }

  function registerPublisher(address publickey)
    isNewPublisher
  {
      for(uint i = 0; i<advertiserList.length;i++){
        depositTable[advertiserList[i]].push(DepositEntry({
          recipient: msg.sender,
          amount: 0
        }));
      }
      publisherList.push(publickey);
      publisherDedup[publickey] = true;
      publisherWeighting.push(1);
  }

  function getDeposit() constant returns(address[],uint[]) {
    address publickey = msg.sender;
    debugAdd = msg.sender;
    address[] memory adds = new address[](advertiserList.length);
  //  adds[0] = entryRow[0].recipient;
    uint[] memory deposits = new uint[](advertiserList.length);
  //  deposits[0] = 0;
    DepositEntry[] entryRow = depositTable[publickey];
    for(uint i = 0; i<advertiserList.length;i++){
      adds[i] = entryRow[i].recipient;
      deposits[i] = entryRow[i].amount;
    }
    return (adds, deposits);
  }

  function verifySignsture(address publickey, bytes32 hashedData, uint8 v, bytes32 r, bytes32 s) internal returns (bool) {
    return publickey == ecrecover(hashedData,v,r,s);
  }

  function verifyOtherConditions(uint blockHightAtBid, uint bidID) internal returns(bool){
    //if pass deadline can't withdraw
    if(blockHightAtBid + withDrawDeadline < block.number){
      return false;
    }
    //if already withdraw can't withdraw
    for(uint i = 0; i<WithdrawHistoryTable.length; i++){
      WithdrawHistoryEntryRow row = WithdrawHistoryTable[i];
      if(row.bidID == bidID){
        return false;
      }
    }
    return true;
  }

  //publisher can call finalize to withdraw payment
  function finalize(uint8 v, bytes32 r, bytes32 s,address payerKey, address receiverKey, uint blockHightAtBid, uint bidID, string AdsURL, uint amount) {

    if (!verifySignsture(payerKey, sha3(receiverKey,blockHightAtBid,bidID,AdsURL,amount), v,r,s)){
      throw;
    }
    if (!verifyOtherConditions(blockHightAtBid, bidID)){
      throw;
    }

    //Verify success send money and make record consistence
    if (!receiverKey.send(amount)) {
      throw;
    }
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
    WithdrawHistoryTable.push(WithdrawHistoryEntryRow({
      advertiser: payerKey,
      publisher: receiverKey,
      withDrawAmount: amount,
      blockHightAtBid: blockHightAtBid,
      bidID:bidID
    }));
  }

  /*function cleanWithdrawTable(){
    for(uint i = 0; i<WithdrawHistoryTable.length; i++){
      WithdrawHistoryEntryRow row = WithdrawHistoryTable[i];
      if(row.blockHightAtBid + withDrawDeadline <  block.number){
        delete
      }
    }
  }*/

  function DDA(address advertiserKey) {
  //TODO -- should called by advertiser to adjust deposit balancing
  }

  function deposit() payable {

    uint deposit = msg.value;
    address advertiser = msg.sender;
    bool inList = false;
    for(uint i = 0; i<advertiserList.length;i++){
      if(advertiserList[i] == advertiser){
        inList = true;
        break;
      }
    }

    DepositEntry[] entryList = depositTable[advertiser];
    if(!inList){
      advertiserList.push(msg.sender);
      for(i = 0; i<publisherList.length;i++){
        entryList.push(DepositEntry({
          recipient: publisherList[i],
          amount: deposit * publisherWeighting[i]/1000
        }));
      }
    }else{
      for(i = 0; i<publisherList.length;i++){
        entryList[i] = DepositEntry({
          recipient: publisherList[i],
          amount: entryList[i].amount + deposit * publisherWeighting[i]/1000
        });
      }
    }

    depositTable[advertiser] = entryList;
    entryList[0];
    //arrangeDeposit(advertiser, deposit, publisherWeighting);
  }

  /*function arrangeDeposit(address advertiser, uint deposit, uint[] weighting) internal{
    DepositEntry[] entryList = depositTable[advertiser];
    for(uint i = 0; i<entryList.length;i++){
      entryList[i] = DepositEntry({
        recipient: entryList[i].recipient,
        amount: entryList[i].amount + deposit * weighting[i]/1000
      });
    }
  }*/
}
