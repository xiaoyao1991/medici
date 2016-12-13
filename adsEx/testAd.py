from ethereum import tester, utils
import bitcoin
import os

s = tester.state()

# Use default addresses for Alice and Bob
alice = tester.a0
bob = tester.a1

print 'Initial balances:'
print 'Alice: %.2f' % (float(s.block.get_balance(alice)) / 10E21)
print '  Bob: %.2f' % (float(s.block.get_balance(bob)) / 10E21)

# Create the contract
full_code = open('sponsor.sol').read().format(alice=alice.encode('hex'),
                                 bob=bob.encode('hex'))
contract = s.abi_contract(full_code)

# zfill: left-pads a string with 0's until 32 bytes
zfill = lambda s: (32-len(s))*'\x00' + s
#
#
# # Alice deposit 30
# s.mine(10)
# s.send(tester.k0, contract.address, int(30*10E21))
# print 'After Deposit Balances:'
# print 'Alice: %.2f' % (float(s.block.get_balance(alice)) / 10E21)
# print '  Bob: %.2f' % (float(s.block.get_balance(bob)) / 10E21)
# print 'Contract: %.2f' % ( float(s.block.get_balance(contract.address)) / 10E21 )
#
# # The payment signature
# def sigamt(amount, priv=tester.k0):
#    amount = utils.int_to_bytes(amount)
#    amount = zfill(amount)
#    pub = bitcoin.privtopub(priv)
#    amthash = utils.sha3(amount)
#    V, R, S = bitcoin.ecdsa_raw_sign(amthash, priv)
#    assert bitcoin.ecdsa_raw_verify(amthash, (V,R,S), pub)
#    return V,R,S
#
# # first payment
# pay5 = sigamt(int(5*10E21))
# # second payment
# pay10 = sigamt(int(10*10E21))
#
# # Bob calls finalize
# V,R,S = pay10
# fval = int(10*10E21)
# contract.finalize(V,R,S, fval, sender=tester.k1)
#
# s.mine(10)
# # Alice calls refund
# #contract.refund(sender=tester.k0)
#
#
# print 'Finalized Balanced:'
# print 'Alice: %.2f' % (float(s.block.get_balance(alice)) / 10E21)
# print '  Bob: %.2f' % (float(s.block.get_balance(bob)) / 10E21)
# print 'Contract: %.2f' % ( float(s.block.get_balance(contract.address)) / 10E21 )
