var web3 = new Web3(Web3.givenProvider);
// the People contract instance in Ganache.
var contractIns;
var contractAddr = "0xaeAcB013531dced836e805C1787040C5cFbf0c01";

$(document).ready(function() {
  $("#name_input").val("Bob");
  $("#age_input").val(55);
  $("#height_input").val(177);

    window.ethereum.enable().then(function (accounts) {
      // callback after user clicking allow metamask.
      // accounts[0] is first account in metamask.
      contractIns = new web3.eth.Contract(abi, contractAddr, {from: accounts[0]});
      console.log("MetaMask accounts:", accounts);
      console.log("People contract instance:", contractIns);
    });

    $("#add_data_button").click(inputData);
    $("#get_data_button").click(fetchAndDisplay);
});

function inputData () {
  var name = $("#name_input").val();
  var age = $("#age_input").val();
  var height = $("#height_input").val();

  var config = {
    value: web3.utils.toWei("1", "ether")
  };
  console.log("createPerson with config:", config);

 // createPerson() will create the transaction
 // send() will sign using metamask and send to blockchain
  contractIns.methods.createPerson(name, age, height).send(config)
  .on("transactionHash", function (hash) {
    console.log("on transaction hash", hash);
  })
  .on("confirmation", function (confNum) {
    console.log("on confirmation #", confNum);
    if (confNum > 12) {
      // e.g notify user
    }
  })
  .on("receipt", function (receipt) {
    console.log("on receipt", receipt);
    // can notify user "its done"
  })
  ;
}

function fetchAndDisplay() {
  // on real network, setter function takes time (as it writes to the blockchain),
  // but getter function always return instantly (as it only queries the blockchain).
  contractIns.methods.getPerson().call().then(function(res) {
    console.log("get person result:", res);
    $("#name_output").text(res.name);
    $("#age_output").text(res.age);
    $("#height_output").text(res.height);
  });
}
