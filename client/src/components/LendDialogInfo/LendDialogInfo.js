import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import OpenInNewIcon from '@material-ui/icons/OpenInNew';import Close from "@material-ui/icons/Close";
import VisibilityIcon from '@material-ui/icons/Visibility';
import ProposalDialog from "components/ProposalDialog/ProposalDialog.js";
import ProposalDialogTable from "components/ProposalDialogTable/ProposalDialogTable.js";

import { blue } from '@material-ui/core/colors';
import Web3 from "web3";

import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import CustomInput from "components/CustomInput/CustomInput.js";
import Button from "components/CustomButtons/Button.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";
import CardActions from '@material-ui/core/CardActions';

const useStyles = makeStyles({
  avatar: {
    backgroundColor: blue[100],
    color: blue[600],
  }
});

export default function BorrowDialogInfo(props) {
  const classes = useStyles();

  const { tableHeaderColor, tableHead, tableData, isa } = props;

  const [ web3, setWeb3 ] = useState(null);
  const [ accounts, setAccounts ] = useState(null);
  const [ currentAccount, setCurrentAccount ] = useState(null);
  const [ isaData, setISAData ] = useState(null)
  const [ started, setStarted ] = useState(false)
  const [ pendingRequest, setPendingRequest ] = useState(null)
  const [ pendingRequestData, setPendingRequestData ] = useState(null)
  const [ index, setIndex ] = useState(null)

  useEffect(() => {
    const init = async() => {
      const web3Instance = new Web3(window.ethereum);
      const accounts = await web3Instance.eth.getAccounts();

      setWeb3(web3Instance)
      setAccounts(accounts)
      setCurrentAccount(accounts[0])

      const data = await getISAData(isa, accounts[0], web3Instance)
      setISAData(data)

      const isStarted = await isa.methods.started().call()
      setStarted(isStarted)
    }

    init();
  }, []);

  async function getISAData(instance, account, web3Instance) {
    var isaData = []

    var timeLeft = ["Time Left (months)"]
    var timeLeftSeconds = await instance.methods.timeLeft().call()
    var timeLeftMonths = (timeLeftSeconds/60/60/24/7/52*12).toFixed(2).toString()
    timeLeft.push(timeLeftMonths)

    var totalPaid = ["Total Payments (eth)"]
    totalPaid.push(web3Instance.utils.fromWei(await instance.methods.totalPaid().call(), 'ether'))

    var buyoutAmount = ["Buyout Amount (eth)"]
    buyoutAmount.push(web3Instance.utils.fromWei(await instance.methods.buyoutAmount().call(), 'ether'))

    var tokensOwned = ["Tokens Owned"]
    tokensOwned.push(await instance.methods.balanceOf(account).call() + "/" +
      await instance.methods.totalSupply().call())

    isaData.push(timeLeft)
    isaData.push(totalPaid)
    isaData.push(buyoutAmount)
    isaData.push(tokensOwned)

    return isaData
  }

  async function startISA() {
    await isa.methods.sign().send( {from: currentAccount})
    const amount = await isa.methods.isaAmount().call()
    console.log(amount)
    const result = await isa.methods.startISA().send( {from: currentAccount, value: amount} )
  }

  async function requestISATransfer() {
    var amountWei = await web3.utils.toWei(amount, 'ether')
    await isa.methods.requestTransfer(account, tokens, amountWei).send({from: currentAccount})
    console.log("transfer requested")
  }

  const [ account, setAccount ] = useState("0xc701aA0e9abe8d634696F8A5F91375172c235F71")
  const [ tokens, setTokens ] = useState("50")
  const [ amount, setAmount ] = useState("0.5")

  return (
    <div>
      <GridContainer>
        {isaData === null ? (
          null
        ) : started == false ? (
          <GridItem xs={12} sm={12} md={12}>
            <Card>
              <CardHeader color="info">
                <h4 className={classes.cardTitleWhite}>Start ISA</h4>
                <p className={classes.cardCategoryWhite}>
                  Click here to start ISA.
                </p>
              </CardHeader>
              <CardBody>
                <Button onClick={startISA} color="info">Start ISA</Button>
              </CardBody>
            </Card>
          </GridItem>
        ) : (
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="info">
              <h4 className={classes.cardTitleWhite}>Detailed Information</h4>
              <p className={classes.cardCategoryWhite}>
                Here is a detailed description of a ISA you have taken out.
              </p>
            </CardHeader>
            <CardBody>
                <ProposalDialogTable
                  tableHeaderColor="info"
                  tableData={isaData}
                />
            </CardBody>
          </Card>
        </GridItem>
        )}
      </GridContainer>
      {started == true ? (
        <>
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <Card>
              <CardHeader color="info">
                <h4 className={classes.cardTitleWhite}>Transfer ISA</h4>
                <p className={classes.cardCategoryWhite}>
                  Here you can transfer your ISA tokens.
                </p>
              </CardHeader>
              <CardBody>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}
                    onChange={(e) => setAccount(e.target.value)}
                    >
                    <CustomInput
                      labelText="Transfer Account"
                      id="transfer-account"
                      formControlProps={{
                        fullWidth: true
                      }}
                    />
                  </GridItem>
                </GridContainer>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}
                    onChange={(e) => setTokens(e.target.value)}
                    >
                    <CustomInput
                      labelText="Token number"
                      id="token-number"
                      formControlProps={{
                        fullWidth: true
                      }}
                    />
                  </GridItem>
                </GridContainer>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}
                    onChange={(e) => setAmount(e.target.value)}
                    >
                    <CustomInput
                      labelText="Price (eth)"
                      id="price"
                      formControlProps={{
                        fullWidth: true
                      }}
                    />
                  </GridItem>
                </GridContainer>
              </CardBody>
              <CardFooter>
                <Button onClick={requestISATransfer} color="info">Request Token Transfer</Button>
              </CardFooter>
            </Card>
          </GridItem>
        </GridContainer>
        </>
      ) : null}
    </div>
  );
}

BorrowDialogInfo.defaultProps = {
  tableHeaderColor: "gray"
};

BorrowDialogInfo.propTypes = {
  tableHeaderColor: PropTypes.oneOf([
    "warning",
    "primary",
    "danger",
    "success",
    "info",
    "rose",
    "gray"
  ]),
  tableHead: PropTypes.arrayOf(PropTypes.string),
  tableData: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
};
