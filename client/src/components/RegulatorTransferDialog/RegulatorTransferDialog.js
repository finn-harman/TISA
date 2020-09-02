import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import PersonIcon from '@material-ui/icons/Person';
import AddIcon from '@material-ui/icons/Add';
import Typography from '@material-ui/core/Typography';
import { blue } from '@material-ui/core/colors';

import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import ProposalDialogTable from "components/ProposalDialogTable/ProposalDialogTable.js";
import BorrowDialogInfo from "components/BorrowDialogInfo/BorrowDialogInfo";
import LendDialogInfo from "components/LendDialogInfo/LendDialogInfo";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";
import CardActions from '@material-ui/core/CardActions';
import Button from "components/CustomButtons/Button.js";
import CustomInput from "components/CustomInput/CustomInput.js";
import ISATransfer from "components/ISATransfer/ISATransfer.js"

import Web3 from "web3";

const useStyles = makeStyles({
  avatar: {
    backgroundColor: blue[100],
    color: blue[600],
  }
});

export default function ProposalDialog(props) {
  const classes = useStyles();
  const { onClose, isa, open } = props;

  const [ web3, setWeb3 ] = useState(null);
  const [ accounts, setAccounts ] = useState(null);
  const [ currentAccount, setCurrentAccount ] = useState(null);
  const [ isaData, setISAData ] = useState(null)
  const [ requestData, setRequestData ] = useState(null)
  const [ request, setRequest ] = useState(null)
  const [ index, setIndex ] = useState(null)

  useEffect(() => {
    const init = async() => {
      const web3Instance = new Web3(window.ethereum);
      const accounts = await web3Instance.eth.getAccounts();

      setWeb3(web3Instance)
      setAccounts(accounts)
      setCurrentAccount(accounts[0])

      const requestIsaData = await getISAData(isa, web3Instance)
      const requestObject = await getRequest(isa, accounts[0], web3Instance)
      const requestData = await getRequestData(isa, requestObject, web3Instance)
      setISAData(requestIsaData)
      setRequest(requestObject)
      setRequestData(requestData)
    }

    init();
  }, []);

  async function getISAData(instance, web3Instance) {
    var isaData = []

    var symbol = ["Symbol"]
    symbol.push(await instance.methods.symbol().call())

    var borrowerAddress = ["Borrower Address"]
    borrowerAddress.push(await instance.methods.borrowerAddress().call())
    var isaAmount = ["ISA Amount"]
    isaAmount.push(web3Instance.utils.fromWei(await instance.methods.isaAmount().call(), 'ether') + " eth")
    var incomePercentage = ["Income Percentage"]
    incomePercentage.push(await instance.methods.incomePercentage().call() + "%")
    var timePeriod = ["Time Period"]
    timePeriod.push(await instance.methods.timePeriod().call()/52*12 + " months")
    var minimumIncome = ["Minimum Income"]
    minimumIncome.push(web3Instance.utils.fromWei(await instance.methods.minimumIncome().call(), 'ether') + " eth")
    var paymentCap = ["Payment Cap"]
    paymentCap.push(web3Instance.utils.fromWei(await instance.methods.paymentCap().call(), 'ether') + " eth")

    isaData.push(symbol)
    isaData.push(borrowerAddress)
    isaData.push(isaAmount)
    isaData.push(incomePercentage)
    isaData.push(timePeriod)
    isaData.push(minimumIncome)
    isaData.push(paymentCap)

    return isaData
  }

  async function getRequest(instance, account, web3Instance) {
    var requestData = []
    var requestsLength = await instance.methods.getRequestCount().call()
    for (var j = 0 ; j < requestsLength ; j++) {
      var request = await instance.methods.requests(j).call()
      if (request[4]) {
        setIndex(j)
        return request
      }
    }
  }

  async function getRequestData(instance, request, web3Instance) {
    var requestData = []

    var from = ["Seller"]
    from.push(request[0])
    var to = ["Buyer"]
    to.push("You")
    var tokenAmount = ["Number of Tokens"]
    tokenAmount.push(request[2])
    var totalTokens = ["Total Token Supply"]
    totalTokens.push(await instance.methods.totalSupply().call())
    var price = ["Price"]
    price.push(web3Instance.utils.fromWei(request[3], 'ether') + " eth")

    requestData.push(from)
    requestData.push(to)
    requestData.push(tokenAmount)
    requestData.push(totalTokens)
    requestData.push(price)

    return requestData
  }

  const handleClose = () => {
    onClose();
  };

  const handleListItemClick = () => {
    onClose();
  };

  const acceptProposal = async () => {
    await isa.methods.agree(index).send({from: currentAccount})
    var request = await getRequest(isa, currentAccount, web3)
    console.log("agreed: " + request[4])
  }

  const rejectProposal = async () => {
    console.log("hello")
  }

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="info">
              <h4 className={classes.cardTitleWhite}>ISA Details</h4>
              <p className={classes.cardCategoryWhite}>
                Here is a detailed description of an ISA involved in a transfer.
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
      </GridContainer>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="info">
              <h4 className={classes.cardTitleWhite}>Transfer Details</h4>
              <p className={classes.cardCategoryWhite}>
                Here are the details of the ISA transfer.
              </p>
            </CardHeader>
            <CardBody>
              <ProposalDialogTable
                tableHeaderColor="info"
                tableData={requestData}
              />
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
      <ISATransfer isa={isa} request={request}/>
    </Dialog>
  );
}

ProposalDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};
