module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(AdExchange);
};
