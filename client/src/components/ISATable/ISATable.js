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
import ISADialog from "components/ISADialog/ISADialog.js";

import ISAFactoryContract from "../../contracts/ISAFactory.json";
import ISAContract from "../../contracts/ISA.json";
import Web3 from "web3";

// core components
import styles from "assets/jss/material-dashboard-react/components/tableStyle.js";

const useStyles = makeStyles(styles);

export default function ISATable(props) {
  const classes = useStyles();

  const { tableHeaderColor, tableHead, tableData, isRegistered, borrow } = props;
  const [open, setOpen] = React.useState(false);

  const [ web3, setWeb3 ] = useState(null);
  const [ isaFactoryContract, setIsaFactoryContract] = useState(null);
  const [ accounts, setAccounts ] = useState(null);
  const [ currentAccount, setCurrentAccount ] = useState(null);
  const [ isas, setIsas ] = useState(null)
  const [ borrowISAs, setBorrowISAs ] = useState(null)
  const [ lendISAs, setLendISAs ] = useState(null)
  const [ borrowISAsData, setBorrowISAsData ] = useState(null)
  const [ lendISAsData, setLendISAsData ] = useState(null)

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
      console.log("Account has " + await isaFactoryInstance.methods.getUsersISANumber().call( {from: accounts[0]}) + " ISAs")
      console.log("There are " + await isaFactoryInstance.methods.getAllISANumber().call( {from: accounts[0] }) + " ISAs in total")

      if (await isaFactoryInstance.methods.getUsersISANumber().call( {from: accounts[0]} ) > 0) {
        const isaObjects = await getISAsFromISAFactory(isaFactoryInstance, accounts[0])
        console.log("ISAs: " + isaObjects)
        setIsas(isaObjects)

        const borrowedISAs = await getBorrowISAContracts(isaObjects, web3Instance, accounts[0])
        setBorrowISAs(borrowedISAs)

        const lenderISAs = await getLendISAContracts(isaObjects, web3Instance, accounts[0])
        setLendISAs(lenderISAs)

        if (borrowedISAs.length > 0) {
          const borrowedISAsData = await getISADataFromISAContracts(borrowedISAs, accounts[0], web3Instance)
          console.log("Borrow ISA data: "+ borrowedISAsData)
          setBorrowISAsData(borrowedISAsData)
        }

        if (lenderISAs.length > 0) {
          const lenderISAsData = await getISADataFromISAContracts(lenderISAs, accounts[0], web3Instance)
          console.log("Lend ISA data: "+ lenderISAsData)
          setLendISAsData(lenderISAsData)
        }
      }
    }

    init();
  }, []);

  function getISAsData() {
    if (borrow) {
      return borrowISAsData;
    } else {
      return lendISAsData;
    }
  }

  function getISAs() {
    if (borrow) {
      return borrowISAs
    } else {
      return lendISAs
    }
  }

  function anyISAs() {
    if (borrow && borrowISAsData != null) {
      return true;
    }
    if (!borrow && lendISAsData != null) {
      return true;
    }
    return false;
  }

  async function getISAsFromISAFactory(isaFactoryInstance, account) {
    const isas = await isaFactoryInstance.methods.getUsersISAs().call( {from: account} )
    return isas
  }

  async function getBorrowISAContracts(isas, web3, account) {
    var isaContracts = []
    for (var i = 0 ; i < isas.length ; i++) {
      const instance = new web3.eth.Contract(
        ISAContract.abi,
        isas[i]
      );

      if (await instance.methods.isBorrower(account).call( {from: account})) {
        isaContracts.push(instance)
      }
    }
    return isaContracts
  }

  async function getLendISAContracts(isas, web3, account) {
    var isaContracts = []
    for (var i = 0 ; i < isas.length ; i++) {
      const instance = new web3.eth.Contract(
        ISAContract.abi,
        isas[i]
      );

      if (await instance.methods.isLender(account).call( {from: account})) {
        isaContracts.push(instance)
      }
    }
    return isaContracts
  }

  async function getISADataFromISAContracts(isas, account, web3Instance) {
    var allISAData = []
    for (var i = 0 ; i < isas.length ; i++) {
      var instance = isas[i]
      var isaData = []

      isaData.push(await instance.methods.symbol().call())
      isaData.push(web3Instance.utils.fromWei(await instance.methods.isaAmount().call(), 'ether') + " eth")
      isaData.push(await instance.methods.incomePercentage().call() + "%")
      isaData.push(await instance.methods.timePeriod().call()/52*12 + " months")

      allISAData.push(isaData)
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
          {(isRegistered === false || isRegistered === undefined) ? (
            <TableRow className={classes.tableHeadRow}>
                <TableCell>
                  <h3>
                    Please first register your address.
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
                    Once ISAs are created, they will show here.
                  </h3>
                </TableCell>
            </TableRow>
          )}
          </TableHead>
        ) : null}
        {isRegistered !== false && tableData !== null && anyISAs() !== false ? (
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
                  <ISADialog isa={getISAs()[key]} borrow={borrow} open={open} onClose={handleClose} />
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
