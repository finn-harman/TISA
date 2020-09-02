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

import ISAFactoryContract from "../../contracts/ISAFactory.json";
import { sha256compression } from '../../utils/hash.js'
import { callServer, parseServerResponse } from '../../utils/zkServerInterface'
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

export default function NewProposal() {
  const classes = useStyles();

  const [ web3, setWeb3 ] = useState(null);
  const [ contract, setContract] = useState(null);
  const [ accounts, setAccounts ] = useState(null);
  const [ currentAccount, setCurrentAccount ] = useState(null);

  useEffect(() => {
    console.log("connecting to ISAFactory contract")
    const init = async() => {
      try {
        const web3 = new Web3(window.ethereum);
        console.log("connected to web3 instance")
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = ISAFactoryContract.networks[networkId];
        const accounts = await web3.eth.getAccounts();
        const instance = new web3.eth.Contract(
          ISAFactoryContract.abi,
          deployedNetwork && deployedNetwork.address,
        );
        console.log("connected to verifier contract")

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

  const [ symbol, setSymbol ] = useState("ABC");
  const [ lenderAddress, setLenderAddress ] = useState("0x1d11E4335012202E17adf951155F78dEEBBFDCa4")
  const [ borrowerAddress, setBorrowerAddress ] = useState("0x7C930023700702CdF3c4C22E33b705C92fd08AC3")
  const [ isaAmount, setIsaAmount ] = useState("1")
  const [ incomePercentage, setIncomePercentage ] = useState(30)
  const [ timePeriod, setTimePeriod ] = useState(1.5)
  const [ minimumIncome, setMinimumIncome ] = useState("5")
  const [ paymentCap, setPaymentCap ] = useState("50")

  const registerDetails = async () => {
    if (!symbol || !lenderAddress || !borrowerAddress || !isaAmount || !incomePercentage || !timePeriod || !minimumIncome || !paymentCap) {
      alert("Error: All fields must be completed");
    } else {
      console.log("symbol: " + symbol)
      console.log("lender address: " + lenderAddress)
      console.log("borrower address: " + borrowerAddress)
      var isaAmountWei = await web3.utils.toWei(isaAmount, 'ether')
      console.log("ISA amount (wei): " + isaAmountWei)
      console.log("Income percentage: " + incomePercentage)
      var timePeriodWeeks = timePeriod * 52
      console.log("Time period (weeks): " + timePeriodWeeks)
      var minimumIncomeWei = await web3.utils.toWei(minimumIncome, 'ether')
      console.log("minimumIncome (wei): " + minimumIncomeWei)
      var paymentCapWei = await web3.utils.toWei(paymentCap, 'ether')
      console.log("payment cap (wei): " + paymentCapWei)

      const proposal = await contract.methods.newProposal(lenderAddress, borrowerAddress,
        isaAmountWei, incomePercentage, timePeriodWeeks, minimumIncomeWei,
        paymentCapWei, symbol
      ).send( {from: currentAccount} )
      console.log(proposal)
    }
  }

  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="info">
              <h4 className={classes.cardTitleWhite}>New Proposal</h4>
              <p className={classes.cardCategoryWhite}>Enter the details of a new ISA proposal.</p>
            </CardHeader>
            <CardBody>
            <GridContainer>
              <GridItem xs={12} sm={12} md={12}
                onChange={(e) => setSymbol(e.target.value)}
                >
                <CustomInput
                  labelText="Symbol"
                  id="symbol"
                  formControlProps={{
                    fullWidth: true
                  }}
                />
              </GridItem>
            </GridContainer>
            <GridContainer>
              <GridItem xs={12} sm={12} md={12}
                onChange={(e) => setLenderAddress(e.target.value)}
                >
                <CustomInput
                  labelText="Lender Address"
                  id="lender-address"
                  formControlProps={{
                    fullWidth: true
                  }}
                />
              </GridItem>
            </GridContainer>
            <GridContainer>
              <GridItem xs={12} sm={12} md={12}
                onChange={(e) => setBorrowerAddress(e.target.value)}
                >
                <CustomInput
                  labelText="Borrower Address"
                  id="borrower-address"
                  formControlProps={{
                    fullWidth: true
                  }}
                />
              </GridItem>
            </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}
                  onChange={(e) => setIsaAmount(e.target.value)}
                  >
                  <CustomInput
                    labelText="ISA Amount (eth)"
                    id="isa-amount"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}
                  onChange={(e) => setIncomePercentage(e.target.value)}
                  >
                  <CustomInput
                    labelText="Income Percentage (%)"
                    id="income-percentage"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  >
                  <CustomInput
                    labelText="ISA Time Period (years)"
                    id="isa-time-period"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}
                  onChange={(e) => setMinimumIncome(e.target.value)}
                  >
                  <CustomInput
                    labelText="Minimum Monthly Income (eth)"
                    id="minimum-income"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}
                  onChange={(e) => setPaymentCap(e.target.value)}
                  >
                  <CustomInput
                    labelText="Monthly Payment Cap (eth)"
                    id="payment-cap"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
              </GridContainer>
            </CardBody>
            <CardFooter>
              <Button onClick={registerDetails} color="info">Create Proposal</Button>
            </CardFooter>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  );
}
