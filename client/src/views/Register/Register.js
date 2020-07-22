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
import ISAFactoryContract from "../../contracts/ISAFactory.json";
import { sha256compression } from '../../utils/hash.js'
import { initialize } from 'zokrates-js';

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

  useEffect(() => {
    console.log("connecting to ISAFactory contact")
    const init = async() => {
      try {
        const web3 = await getWeb3();
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = ISAFactoryContract.networks[networkId];
        const accounts = await web3.eth.getAccounts();
        const instance = new web3.eth.Contract(
          ISAFactoryContract.abi,
          deployedNetwork && deployedNetwork.address,
        );

        setWeb3(web3)
        setContract(instance)
        setAccounts(accounts)

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

  const convertAndPad = (input) => {
    var output = ""

    for (var i = 0; i < input.length; i++) {
        var bin = (input[i].charCodeAt(0).toString(2)).padStart(8,"0")
        output += bin
    }

    output = output.padStart(512, "0");
    return output;
  }

  const registerDetails = async () => {
    if (!name || !postCode || !nationalInsurance || !email) {
      alert("Error: All fields must be completed");
    } else {
      console.log("Name: " + name)
      console.log("Post Code: " + postCode)
      console.log("National Insurance Number: " + nationalInsurance)
      console.log("Email: " + email)

      console.log("Constructing hash input...")
      var personalDetails = name + postCode + nationalInsurance + email
      console.log("Personal Details: " + personalDetails)
      personalDetails = personalDetails.replace(/\s/g, '')
      console.log("Personal Details after replace: " + personalDetails)
      personalDetails = personalDetails.toLowerCase()
      console.log("Personal Details after lower case: " + personalDetails)
      const personalDetailsBinary = convertAndPad(personalDetails)
      console.log("Personal Details after convert and pad: " + personalDetailsBinary)

      const personalDetailsBinarySplit = personalDetailsBinary.match(/.{1,128}/g);
      console.log("Personal Details after split into 4: " + personalDetailsBinarySplit)

      const hash = sha256compression(personalDetailsBinary)
      console.log("Personal Details hash: " + hash)

      // Generate witness based on hash using zokrates
      const program = `
      import "hashes/sha256/512bitPacked" as sha256packed

      def main(private field a, private field b, private field c, private field d) -> (field):
          h = sha256packed([a, b, c, d])
          h[0] == 263561599766550617289250058199814760685
          return 1
      `;

      const start = new Date().getTime()
      console.log("start: " + start)

      const provider = await initialize()

      console.log(provider);
      const artifacts = provider.compile(program, "main", null);
      console.log("Running setup");
      const keypair = provider.setup(artifacts.program);
      console.log(keypair.pk)

      const end1 = new Date().getTime()
      console.log("delta1: " + (end1-start))
      const result = provider.computeWitness(artifacts, ["0", "0", "0", "5"]);

      console.log("Output: " + result.output + "\n"); // output: ["1"]



      console.log("Generating proof");
      const proof = provider.generateProof(artifacts.program, result.witness, keypair.pk);
      console.log(proof);

      const end2 = new Date().getTime()
      console.log("end: " + end2)
      console.log("delta2: " + (end2-end1))
      // Call verifyTx of Verifier.sol to verify hash
      // If successful, check hash against database and add address to database
    }
  }

  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={8}>
          <Card>
            <CardHeader color="primary">
              <h4 className={classes.cardTitleWhite}>Register</h4>
              <p className={classes.cardCategoryWhite}>Insert your personal details to connect your real life identity to your Ethereum address</p>
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
              <Button onClick={registerDetails} color="primary">Register Details</Button>
            </CardFooter>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  );
}
