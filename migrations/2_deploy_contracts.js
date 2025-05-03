const EventTicketNFT = artifacts.require("EventTicketNFT");

module.exports = function (deployer) {
  deployer.deploy(EventTicketNFT);
};
