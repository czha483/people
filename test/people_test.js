const People = artifacts.require("People");
const truffleAssert = require("truffle-assertions");

contract("People", async function (accounts) {

  let instance;

  before(async function () {
    // initialization, run once
    instance = await People.deployed();
  });

  beforeEach(async function () {
    // run before each test.
  });

  // there is also after() and afterEach()

  it("shouldn't create a person of 250 old", async function () {
    await truffleAssert.fails(
      instance.createPerson("Bob", 250, 190, {value: web3.utils.toWei("1", "ether")}),
      // specifiy which type of error we are expecting
      truffleAssert.ErrorType.REVERT
    );
  });
  it("shouldn't create a person with <1 ether payment", async function () {
    await truffleAssert.fails(
      instance.createPerson("Bob", 55, 190, {value: 100}),
      truffleAssert.ErrorType.REVERT
    );
  });
  it("should set senior status correctly", async function () {
    await instance.createPerson("Bob", 66, 190, {value: web3.utils.toWei("1", "ether")});
    let result = await instance.getPerson();
    assert(result.senior === true, "senior level not set");
  });
  // the contract instance is shared amount all tests.
  // to create a new contract instance:
  //   let instance = await People.new();
  it("should have the same contract instance", async function () {
    // get the Bob person created in previous test.
    let result = await instance.getPerson();
    assert(result.name === "Bob", "name should be Bob, but is " + result.name);
  });
  // onlyOwner test assignment
  it("onlyOwner test", async function () {
    //console.log("accounts:", accounts);
    let creator = accounts[1]; // not necessarily owner
    await instance.createPerson("Lisa", 66, 190,
      {from: creator, value: web3.utils.toWei("1", "ether")}
    );
    // the contract is deployed by accounts[0], which becomes the owner,
    // so if accounts[1] try to delete a person it should fail.
    await truffleAssert.fails(
      instance.deletePerson(creator, {from: accounts[1]}),
      truffleAssert.ErrorType.REVERT
    );
    await truffleAssert.passes(
      instance.deletePerson(creator, {from: accounts[0]})
    );
  });

  // contract balance value tests

  let oneEther = parseInt(web3.utils.toWei("1", "ether"));

  it("balance test 1", async function () {
    let internalBalanceBefore = parseInt(await instance.balance());
    await instance.createPerson("Bobby", 55, 190, {value: oneEther});
    let internalBalanceAfter = parseInt(await instance.balance());
    let actualBalanceAfter = parseInt(await web3.eth.getBalance(instance.address));
    // console.log("internal and actual balance:", internalBalance, actualBalance);
    assert(internalBalanceAfter === internalBalanceBefore + oneEther &&
      internalBalanceAfter === actualBalanceAfter);
  });

  it("balance test 2", async function () {
    let owner = accounts[0];
    let balance = parseInt(await instance.balance());
    let ownerBalanceBefore = parseInt(await web3.eth.getBalance(owner));
    await instance.withdrawAll();
    let internalBalanceAfter = parseInt(await instance.balance());
    let actualBalanceAfter = parseInt(await web3.eth.getBalance(instance.address));
    let ownerBalanceAfter = parseInt(await web3.eth.getBalance(owner));
    // what the owner received will be less then the balance due to gas cost.
    let ownerReceived = ownerBalanceAfter - ownerBalanceBefore;
    assert(0 < ownerReceived && ownerReceived < balance,
      "owner received amount does not look right. owner got "+ownerReceived+" balance withdrawn "+balance);
    assert(internalBalanceAfter === 0 && actualBalanceAfter === 0,
      "contract balance should be 0 after withdraw all");
  });

});
