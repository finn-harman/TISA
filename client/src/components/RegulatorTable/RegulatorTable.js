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
import RegulatorDialog from "components/RegulatorDialog/RegulatorDialog.js";

import ISAFactoryContract from "../../contracts/ISAFactory.json";
import ProposalContract from "../../contracts/Proposal.json";
import Web3 from "web3";

// core components
import styles from "assets/jss/material-dashboard-react/components/tableStyle.js";

const useStyles = makeStyles(styles);

export default function ProposalTable(props) {
  const classes = useStyles();

  const { tableHeaderColor, tableHead, tableData } = props;

  const [open, setOpen] = React.useState(false);

  const [ web3, setWeb3 ] = useState(null);
  const [ isaFactoryContract, setIsaFactoryContract] = useState(null);
  const [ accounts, setAccounts ] = useState(null);
  const [ currentAccount, setCurrentAccount ] = useState(null);
  const [ newProposals, setNewProposals ] = useState(null)
  const [ newProposalsContracts, setNewProposalsContracts ] = useState(null)
  const [ newProposalsData, setNewProposalsData ] = useState(null)
  const [ isOwner, setIsOwner ] = useState(null)

  useEffect(() => {
    const init = async() => {
      console.log("Loading Regulator Table")
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
      setIsOwner(accounts[0] == await isaFactoryInstance.methods.getRegulatorAddress().call( { from: accounts[0] }))

      console.log("all agreed proposal number: ", await isaFactoryInstance.methods.getAllAgreedProposalNumber().call( {from: accounts[0]}))
      console.log("all proposal number: ", await isaFactoryInstance.methods.getAllProposalNumber().call( {from: accounts[0]}))

      if (await isaFactoryInstance.methods.getAllAgreedProposalNumber().call( {from: accounts[0]} ) > 0) {
        const prop = await getProposalsFromISAFactory(isaFactoryInstance, accounts[0])
        setNewProposals(prop)

        const agreedProp = await getAgreedProposalContracts(prop, web3Instance, accounts[0])
        setNewProposalsContracts(agreedProp)

        if (agreedProp.length > 0) {
          const agreedPropData = await getProposalDataFromProposalContracts(agreedProp)
          console.log("Agreed proposal data: "+ agreedPropData)
          setNewProposalsData(agreedPropData)
        }
      }
    }

    init();
  }, []);

  function getProposalsData() {
    return newProposalsData
  }

  function getProposals() {
    return newProposalsContracts
  }

  function anyProposals() {
    if (newProposalsData != null) {
      return true;
    }
    return false;
  }

  async function getProposalsFromISAFactory(isaFactoryInstance, account) {
    const proposals = await isaFactoryInstance.methods.getAllAgreedProposals().call( {from: account})
    return proposals
  }

  async function getAgreedProposalContracts(proposals, web3, account) {
    var agreedProposals = []
    for (var i = 0 ; i < proposals.length ; i++) {
      const instance = new web3.eth.Contract(
        ProposalContract.abi,
        proposals[i]
      );

      agreedProposals.push(instance)
    }
    return agreedProposals
  }

  async function getProposalDataFromProposalContracts(proposals) {
    var allProposalData = []
    for (var i = 0 ; i < proposals.length ; i++) {
      var instance = proposals[i]
      var proposalData = []

      proposalData.push(await instance.methods.symbol().call())

      const lenderAddress = await instance.methods.lenderAddress().call()
      const borrowerAddress = await instance.methods.borrowerAddress().call()
      proposalData.push(lenderAddress)
      proposalData.push(borrowerAddress)

      proposalData.push("$" + await instance.methods.isaAmount().call())
      proposalData.push(await instance.methods.incomePercentage().call() + "%")
      proposalData.push(await instance.methods.timePeriod().call() + " months")

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
          {( isOwner !== true ) ? (
            <TableRow className={classes.tableHeadRow}>
                <TableCell>
                  <h3>
                    Only visible to Regulator.
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
                    Once Proposals are agreed to by both parties, they will show here.
                  </h3>
                </TableCell>
            </TableRow>
          )}
          </TableHead>
        ) : null}
        {isOwner !== false && tableData !== null && anyProposals() !== false ? (
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
                  <RegulatorDialog proposal={getProposals()[key]} open={open} onClose={handleClose} />
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
};
