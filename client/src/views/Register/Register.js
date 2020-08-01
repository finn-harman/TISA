import React, { useState, useEffect } from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import CustomInput from "components/CustomInput/CustomInput.js";
import Button from "components/CustomButtons/Button.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";

//connect to blockchain
import getWeb3 from "../../utils/getWeb3";
import Web3 from "web3";

import RegulatorContract from "../../contracts/Regulator.json";
import { sha256compression } from '../../utils/hash.js'
import { getData, register } from '../../utils/regulatorServerInterface'
import { convertAndPad } from '../../utils/string-helpers'

const styles = {
  cardCategoryWhite: {
    color: "rgba(255,255,255,.62)",
    margin: "0",
    fontSize: "14px",
    marginTop: "0",
    marginBottom: "0"
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none"
  }
};

const useStyles = makeStyles(styles);

export default function Register() {
  const classes = useStyles();

  const [ web3, setWeb3 ] = useState(null);
  const [ contract, setContract] = useState(null);
  const [ accounts, setAccounts ] = useState(null);
  const [ currentAccount, setCurrentAccount ] = useState(null);

  useEffect(() => {
    console.log("connecting to Regulator contract")
    const init = async() => {
      try {
        const web3 = new Web3(window.ethereum);
        console.log("connected to web3 instance")
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = RegulatorContract.networks[networkId];
        const accounts = await web3.eth.getAccounts();
        const instance = new web3.eth.Contract(
          RegulatorContract.abi,
          deployedNetwork && deployedNetwork.address,
        );
        console.log("connected to Regulator contract")

        setWeb3(web3)
        setContract(instance)
        setAccounts(accounts)
        setCurrentAccount(accounts[0])
      } catch(error) {
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
      }
    }

    init();
  }, []);

  const [ name, setName ] = useState("Joe Bloggs")
  const [ postCode, setPostCode ] = useState("E1 0WL")
  const [ nationalInsurance, setNationalInsurance ] = useState("12345678")
  const [ email, setEmail ] = useState("joebloggs@gmail.com")

  // const [ name, setName ] = useState(null)
  // const [ postCode, setPostCode ] = useState(null)
  // const [ nationalInsurance, setNationalInsurance ] = useState(null)
  // const [ email, setEmail ] = useState(null)

  const registerDetails = async () => {
    if (!name || !postCode || !nationalInsurance || !email) {
      alert("Error: All fields must be completed");
    } else {
      console.log("Name: " + name)
      console.log("Post Code: " + postCode)
      console.log("National Insurance Number: " + nationalInsurance)
      console.log("Email: " + email)

      const hash = convertAndPad(name, postCode, nationalInsurance, email)
      console.log("Personal Details hash: " + hash)

      // Generate witness based on hash using zokrates
      // Manipulate return value
      // Call verifyTx of Verifier.sol to verify hash
      console.log("Registering from account: " + currentAccount)
      const verifiedEvent = await contract.methods.register(true).send( {from: currentAccount} )
      // If successful, check hash against database and add address to database
      console.log(verifiedEvent)
      // if (verifiedEvent.events.Verified.event == "Verified") {
      //
      // }
    }
  }

  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={8}>
          <Card>
            <CardHeader color="info">
              <h4 className={classes.cardTitleWhite}>Register</h4>
              <p className={classes.cardCategoryWhite}>Enter your personal details to connect your real life identity to your Ethereum address</p>
            </CardHeader>
            <CardBody>
              <GridContainer>
                <GridItem xs={12} sm={12} md={6}
                  onChange={(e) => setName(e.target.value)}
                  >
                  <CustomInput
                    labelText="Full name"
                    id="full-name"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={6}
                  onChange={(e) => setPostCode(e.target.value)}
                  >
                  <CustomInput
                    labelText="Post Code"
                    id="post-code"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={6}
                  onChange={(e) => setNationalInsurance(e.target.value)}
                  >
                  <CustomInput
                    labelText="National Insurance Number"
                    id="national-insurance-number"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={6}
                  onChange={(e) => setEmail(e.target.value)}
                  >
                  <CustomInput
                    labelText="Email Address"
                    id="email-address"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
              </GridContainer>
            </CardBody>
            <CardFooter>
              <Button onClick={registerDetails} color="info">Register Details</Button>
            </CardFooter>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  );
}
