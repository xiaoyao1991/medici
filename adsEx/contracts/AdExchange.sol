pragma solidity ^0.4.2;
// Proof of Existence contract, version 2
contract  MicroPayment {
  // state
  bytes32[] private proofs;
  // store a proof of existence in the contract state
  // *transactional function*
  private byte32[] payerPublicAddr;
  private byte32[] recipientPublicAddr;
  private double deadline;

  function verifySignsture(string document) {
    proof = calculateProof(document);
  }


}
