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
import RegulatorTransferDialog from "components/RegulatorTransferDialog/RegulatorTransferDialog.js";

import ISAFactoryContract from "../../contracts/ISAFactory.json";
import ISAContract from "../../contracts/ISA.json";
import Web3 from "web3";

// core components
import styles from "assets/jss/material-dashboard-react/components/tableStyle.js";

const useStyles = makeStyles(styles);

export default function ISATable(props) {
  const classes = useStyles();

  const { tableHeaderColor, tableHead, tableData } = props;
  const [open, setOpen] = React.useState(false);

  const [ web3, setWeb3 ] = useState(null);
  const [ isaFactoryContract, setIsaFactoryContract] = useState(null);
  const [ accounts, setAccounts ] = useState(null);
  const [ currentAccount, setCurrentAccount ] = useState(null);
  const [ isas, setIsas ] = useState(null)
  const [ isasData, setISAsData ] = useState(null)
  const [ isOwner, setIsOwner ] = useState(null)

  useEffect(() => {
    const init = async() => {
      console.log("Loading ISA Table")
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

      console.log("There are " + await isaFactoryInstance.methods.getAllISANumber().call( {from: accounts[0] }) + " ISAs in total")

      if (await isaFactoryInstance.methods.getAllISANumber().call( {from: accounts[0]} ) > 0) {

        var requestIsas = await getRequestISAs(isaFactoryInstance, web3Instance, accounts[0])
        setIsas(requestIsas)

        if (requestIsas.length > 0) {
          const requestIsaData = await getISADataFromISAContracts(requestIsas, accounts[0], web3Instance)
          setISAsData(requestIsaData)
        }
      }
    }

    init();
  }, []);

  async function getRequestISAs(isaFactory, web3, account, element) {
    var requestISAs = []

    var isas = await isaFactory.methods.getAllISAs().call({from: account})
    for (var i = 0 ; i < isas.length ; i++) {
      const instance = new web3.eth.Contract(
        ISAContract.abi,
        isas[i]
      );

      var requestsLength = await instance.methods.getRequestCount().call({from: account})
      for (var j = 0 ; j < requestsLength ; j++) {
        var request = await instance.methods.requests(j).call({from: account})
        if (request[4] && !request[6]) {
          requestISAs.push(instance)
        }
      }
    }

    return requestISAs
  }


  function getISAsData() {
    return isasData
  }

  function getISAs() {
    return isas
  }

  function anyISAs() {
    if (isasData != null) {
      return true;
    }
    return false;
  }


  async function getISADataFromISAContracts(isas, account, web3Instance) {
    var allISAData = []
    for (var i = 0 ; i < isas.length ; i++) {
      var instance = isas[i]

      var requestsLength = await instance.methods.getRequestCount().call({from: account})
      for (var j = 0 ; j < requestsLength ; j++) {
        var request = await instance.methods.requests(j).call({from: account})
        if (request[4] && !request[6]) {

          var isaData = []

          isaData.push(await instance.methods.symbol().call())
          isaData.push(request[0])
          isaData.push(request[2] + "/" + await instance.methods.totalSupply().call())
          isaData.push(web3Instance.utils.fromWei(request[3], 'ether') + " eth")

          allISAData.push(isaData)
        }
      }
    }

    return allISAData
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
          ) : anyISAs() == true ? (
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
                    Once Requests are created, they will show here.
                  </h3>
                </TableCell>
            </TableRow>
          )}
          </TableHead>
        ) : null}
        {isOwner !== false && tableData !== null && anyISAs() !== false ? (
        <TableBody>
          {getISAsData().map((prop, key) => {
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
                  <RegulatorTransferDialog isa={getISAs()[key]} open={open} onClose={handleClose} />
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

ISATable.defaultProps = {
  tableHeaderColor: "gray"
};

ISATable.propTypes = {
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
