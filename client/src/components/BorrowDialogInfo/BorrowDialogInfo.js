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

  useEffect(() => {
    const init = async() => {
      const web3Instance = new Web3(window.ethereum);
      const accounts = await web3Instance.eth.getAccounts();

      setWeb3(web3Instance)
      setAccounts(accounts)
      setCurrentAccount(accounts[0])

      const data = await getISAData(isa, web3Instance)
      setISAData(data)

      const isStarted = await isa.methods.started().call()
      setStarted(isStarted)
    }

    init();
  }, []);

  async function getISAData(instance, web3Instance) {
    var isaData = []

    var timeLeft = ["Time Left (months)"]
    var timeLeftSeconds = await instance.methods.timeLeft().call()
    var timeLeftMonths = (timeLeftSeconds/60/60/24/7/52*12).toFixed(2).toString()
    timeLeft.push(timeLeftMonths)

    var totalPaid = ["Total Payments (eth)"]
    totalPaid.push(await web3Instance.utils.fromWei(await instance.methods.totalPaid().call(), 'ether'))

    console.log("total payments: " + await web3Instance.utils.fromWei(await instance.methods.totalPaid().call(), 'ether'))

    var buyoutAmount = ["Buyout Amount (eth)"]
    buyoutAmount.push(web3Instance.utils.fromWei(await instance.methods.buyoutAmount().call(), 'ether'))

    isaData.push(timeLeft)
    isaData.push(totalPaid)
    isaData.push(buyoutAmount)

    return isaData
  }

  async function payIncome() {
    console.log("pay income")
    var percentage = await isa.methods.incomePercentage().call() / 100
    var contribution = (income * percentage).toString()
    var contributionWei = await web3.utils.toWei(contribution, 'ether')
    console.log(contributionWei)
    await isa.methods.payIncome().send({from: currentAccount, value: contributionWei})
    // await isa.methods.payIncome().send({from: currentAccount})
    console.log(await isa.methods.totalPaid().call())
  }

  async function buyoutISA() {
    console.log("buyout isa")

  }

  const [ income, setIncome ] = useState("5.1")

  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="info">
              <h4 className={classes.cardTitleWhite}>Detailed Information</h4>
              <p className={classes.cardCategoryWhite}>
                Here is a detailed description of a ISA you have taken out.
              </p>
            </CardHeader>
            <CardBody>
              {isaData === null ? (
                null
              ) : started == false ? (
                <Table className={classes.table}>
                  <TableHead>
                    <TableRow className={classes.tableHeadRow}>
                        <TableCell>
                          <h3>
                            Lender has not started ISA.
                          </h3>
                        </TableCell>
                    </TableRow>
                  </TableHead>
                </Table>
                ) :
                (
                <ProposalDialogTable
                  tableHeaderColor="info"
                  tableData={isaData}
                />
              )}
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
      {started == true ? (
      <>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="info">
              <h4 className={classes.cardTitleWhite}>Pay into ISA</h4>
              <p className={classes.cardCategoryWhite}>
                Here you can pay your income into your ISA.
              </p>
            </CardHeader>
            <CardBody>
              <GridContainer>
                <GridItem xs={12} sm={12} md={12}
                  onChange={(e) => setIncome(e.target.value)}
                  >
                  <CustomInput
                    labelText="Income (eth)"
                    id="income"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
              </GridContainer>
            </CardBody>
            <CardFooter>
              <Button onClick={payIncome} color="info">Pay Income</Button>
            </CardFooter>
          </Card>
        </GridItem>
      </GridContainer>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="info">
              <h4 className={classes.cardTitleWhite}>Buyout ISA </h4>
              <p className={classes.cardCategoryWhite}>
                Here you can buy out ISA.
              </p>
            </CardHeader>
            <CardBody>
              <Button onClick={buyoutISA} color="info">Buyout ISA</Button>
            </CardBody>
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
