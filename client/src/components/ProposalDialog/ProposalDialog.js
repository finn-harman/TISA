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
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";
import CardActions from '@material-ui/core/CardActions';
import Button from "components/CustomButtons/Button.js";
import CustomInput from "components/CustomInput/CustomInput.js";

import Web3 from "web3";

const useStyles = makeStyles({
  avatar: {
    backgroundColor: blue[100],
    color: blue[600],
  }
});

export default function ProposalDialog(props) {
  const classes = useStyles();
  const { onClose, proposal, pending, open } = props;

  const [ web3, setWeb3 ] = useState(null);
  const [ accounts, setAccounts ] = useState(null);
  const [ currentAccount, setCurrentAccount ] = useState(null);
  const [ proposalData, setProposalData ] = useState(null)

  useEffect(() => {
    const init = async() => {
      const web3Instance = new Web3(window.ethereum);
      const accounts = await web3Instance.eth.getAccounts();

      setWeb3(web3Instance)
      setAccounts(accounts)
      setCurrentAccount(accounts[0])

      const propData = await getProposalData(proposal, accounts[0], web3Instance)
      setProposalData(propData)
    }

    init();
  }, []);

  async function getProposalData(instance, account, web3Instance) {
    var proposalData = []

    var symbol = ["Symbol"]
    symbol.push(await instance.methods.symbol().call())

    var lenderAddress = ["Lender Address"]
    var borrowerAddress = ["Borrower Address"]

    var lenderAddressCall = await instance.methods.lenderAddress().call()
    var borrowerAddressCall = await instance.methods.borrowerAddress().call()

    if (lenderAddressCall == account) {
      lenderAddress.push("You")
      borrowerAddress.push(borrowerAddressCall)
    } else {
      lenderAddress.push(lenderAddressCall)
      borrowerAddress.push("You")
    }

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

    proposalData.push(symbol)
    proposalData.push(lenderAddress)
    proposalData.push(borrowerAddress)
    proposalData.push(isaAmount)
    proposalData.push(incomePercentage)
    proposalData.push(timePeriod)
    proposalData.push(minimumIncome)
    proposalData.push(paymentCap)

    return proposalData
  }

  const handleClose = () => {
    onClose();
  };

  const handleListItemClick = () => {
    onClose();
  };

  const acceptProposal = async () => {
    await proposal.methods.agree().send( {from: currentAccount} )
  }

  const rejectProposal = async () => {
    await proposal.methods.reject().send( {from: currentAccount} )
  }

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            {pending === true ? (
            <CardHeader color="info">
              <h4 className={classes.cardTitleWhite}>Pending ISA Proposal</h4>
              <p className={classes.cardCategoryWhite}>
                Here is a detailed description of a pending ISA proposal you have been included in.
                If you agree to the terms of this ISA, please click accept. Once both parties have
                clicked confirm, you will both be sent a legal contract to sign at which point the
                ISA will be created.
              </p>
            </CardHeader>
            ) : (
              <CardHeader color="info">
                <h4 className={classes.cardTitleWhite}>Signed ISA Proposal</h4>
                <p className={classes.cardCategoryWhite}>
                  Here is a detailed description of an agreed ISA proposal you have been included in.
                </p>
              </CardHeader>
            )}
            <CardBody>
              <ProposalDialogTable
                tableHeaderColor="info"
                tableData={proposalData}
              />
            </CardBody>
            {pending === true ? (
            <CardActions>
              <Button onClick={acceptProposal} color="success">Accept</Button>
              <Button onClick={rejectProposal} color="danger">Reject</Button>
            </CardActions>
            ) : null}
          </Card>
        </GridItem>
      </GridContainer>
    </Dialog>
  );
}

ProposalDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};
