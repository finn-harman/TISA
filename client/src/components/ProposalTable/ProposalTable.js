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

import ISAFactoryContract from "../../contracts/ISAFactory.json";
import ProposalContract from "../../contracts/Proposal.json";
import Web3 from "web3";

// core components
import styles from "assets/jss/material-dashboard-react/components/tableStyle.js";

const useStyles = makeStyles(styles);

export default function ProposalTable(props) {
  const classes = useStyles();

  const { tableHeaderColor, tableHead, tableData, isRegistered, pending } = props;
  const [open, setOpen] = React.useState(false);

  const [ web3, setWeb3 ] = useState(null);
  const [ isaFactoryContract, setIsaFactoryContract] = useState(null);
  const [ accounts, setAccounts ] = useState(null);
  const [ currentAccount, setCurrentAccount ] = useState(null);
  const [ proposals, setProposals ] = useState(null)
  const [ pendingProposals, setPendingProposals ] = useState(null)
  const [ signedProposals, setSignedProposals ] = useState(null)
  const [ pendingProposalsData, setPendingProposalsData ] = useState(null)
  const [ signedProposalsData, setSignedProposalsData ] = useState(null)

  useEffect(() => {
    const init = async() => {
      console.log("Loading Proposal Table")
      const web3Instance = new Web3(window.ethereum);
      const networkId = await web3Instance.eth.net.getId();
      const isaFactoryDeployedNetwork = ISAFactoryContract.networks[networkId];
      const accounts = await web3Instance.eth.getAccounts();
      const isaFactoryInstance = new web3Instance.eth.Contract(
        ISAFactoryContract.abi,
        isaFactoryDeployedNetwork && isaFactoryDeployedNetwork.address,
      );

      setWeb3(web3Instance)
      setIsaFactoryContract(isaFactoryInstance)
      setAccounts(accounts)
      setCurrentAccount(accounts[0])
      console.log("Account has " + await isaFactoryInstance.methods.getUsersProposalNumber().call( {from: accounts[0]}) + " proposals")
      console.log("There are " + await isaFactoryInstance.methods.getAllProposalNumber().call( {from: accounts[0] }) + " proposals in total")

      if (await isaFactoryInstance.methods.getUsersProposalNumber().call( {from: accounts[0]} ) > 0) {
        const prop = await getProposalsFromISAFactory(isaFactoryInstance, accounts[0])
        setProposals(prop)

        const pendingProp = await getPendingProposalContracts(prop, web3Instance, accounts[0])
        setPendingProposals(pendingProp)

        const signedProp = await getSignedProposalContracts(prop, web3Instance, accounts[0])
        setSignedProposals(signedProp)

        if (pendingProp.length > 0) {
          const pendingPropData = await getProposalDataFromProposalContracts(pendingProp, accounts[0], web3Instance)
          console.log("Pending proposal data: "+ pendingPropData)
          setPendingProposalsData(pendingPropData)
        }

        if (signedProp.length > 0) {
          const signedPropData = await getProposalDataFromProposalContracts(signedProp, accounts[0], web3Instance)
          console.log("Signed proposal data: "+ signedPropData)
          setSignedProposalsData(signedPropData)
        }
      }
    }

    init();
  }, []);

  function getProposalsData() {
    if (pending) {
      return pendingProposalsData;
    } else {
      return signedProposalsData;
    }
  }

  function getProposals() {
    if (pending) {
      return pendingProposals
    } else {
      return signedProposals
    }
  }

  function anyProposals() {
    if (pending && pendingProposalsData != null) {
      return true;
    }
    if (!pending && signedProposalsData != null) {
      return true;
    }
    return false;
  }

  async function getProposalsFromISAFactory(isaFactoryInstance, account) {
    const proposals = await isaFactoryInstance.methods.getUsersProposals().call( {from: account})
    return proposals
  }

  async function getPendingProposalContracts(proposals, web3, account) {
    var pendingProposals = []
    for (var i = 0 ; i < proposals.length ; i++) {
      const instance = new web3.eth.Contract(
        ProposalContract.abi,
        proposals[i]
      );

      if (await instance.methods.isPending().call( {from: account})) {
        pendingProposals.push(instance)
      }
    }
    return pendingProposals
  }

  async function getSignedProposalContracts(proposals, web3, account) {
    var signedProposals = []
    for (var i = 0 ; i < proposals.length ; i++) {
      const instance = new web3.eth.Contract(
        ProposalContract.abi,
        proposals[i]
      );

      if (await instance.methods.isSigned().call( {from: account}) && !await instance.methods.expired().call( {from: account})) {
        signedProposals.push(instance)
      }
    }
    return signedProposals
  }

  async function getProposalDataFromProposalContracts(proposals, account, web3Instance) {
    var allProposalData = []
    for (var i = 0 ; i < proposals.length ; i++) {
      var instance = proposals[i]
      var proposalData = []

      proposalData.push(await instance.methods.symbol().call())

      const lenderAddress = await instance.methods.lenderAddress().call()
      const borrowerAddress = await instance.methods.borrowerAddress().call()

      if (lenderAddress == account) {
        proposalData.push("You")
        proposalData.push(borrowerAddress)
      } else {
        proposalData.push(lenderAddress)
        proposalData.push("You")
      }

      proposalData.push(web3Instance.utils.fromWei(await instance.methods.isaAmount().call(), 'ether') + " eth")

      proposalData.push(await instance.methods.incomePercentage().call() + "%")
      proposalData.push(await instance.methods.timePeriod().call()/52*12 + " months")

      allProposalData.push(proposalData)
    }

    return allProposalData
  }

  const handleClickOpen = (prop) => {
    setOpen(true);
  };

  const handleClose = (value) => {
    setOpen(false);
  };

  return (
    <div className={classes.tableResponsive}>
      <Table className={classes.table}>
        {tableHead !== undefined ? (
          <TableHead className={classes[tableHeaderColor + "TableHeader"]}>
          {(isRegistered === false || isRegistered === undefined) ? (
            <TableRow className={classes.tableHeadRow}>
                <TableCell>
                  <h3>
                    Please first register your address.
                  </h3>
                </TableCell>
            </TableRow>
          ) : anyProposals() == true ? (
            <TableRow className={classes.tableHeadRow}>
              {tableHead.map((prop, key) => {
                return (
                  <TableCell
                    className={classes.tableCell + " " + classes.tableHeadCell}
                    key={key}
                  >
                    {prop}
                  </TableCell>
                );
              })}
            </TableRow>
          ) : (
            <TableRow className={classes.tableHeadRow}>
                <TableCell>
                  <h3>
                    Once Proposals are created, they will show here.
                  </h3>
                </TableCell>
            </TableRow>
          )}
          </TableHead>
        ) : null}
        {isRegistered !== false && tableData !== null && anyProposals() !== false ? (
        <TableBody>
          {getProposalsData().map((prop, key) => {
            return (
              <TableRow key={key} className={classes.tableBodyRow}>
                {prop.map((prop, key) => {
                  return (
                    <TableCell className={classes.tableCell} key={key}>
                      {prop}
                    </TableCell>
                  );
                })}
                <TableCell className={classes.tableActions}>
                  <Tooltip
                    id="tooltip-top"
                    title="View"
                    placement="top"
                    classes={{ tooltip: classes.tooltip }}
                  >
                    <IconButton
                      aria-label="Edit"
                      className={classes.tableActionButton}
                      onClick={() => { handleClickOpen() }}
                    >
                      <VisibilityIcon
                        className={
                          classes.tableActionButtonIcon + " " + classes.edit
                        }
                      />
                    </IconButton>
                  </Tooltip>
                  <ProposalDialog proposal={getProposals()[key]} pending={pending} open={open} onClose={handleClose} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        ) : null}
      </Table>
    </div>
  );
}

ProposalTable.defaultProps = {
  tableHeaderColor: "gray"
};

ProposalTable.propTypes = {
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
  isRegistered: PropTypes.oneOf(PropTypes.bool)
};
