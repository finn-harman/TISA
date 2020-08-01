import React, { useState, useEffect } from "react";
// react plugin for creating charts
import ChartistGraph from "react-chartist";
// @material-ui/core
import { makeStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
// @material-ui/icons
import Store from "@material-ui/icons/Store";
import CheckIcon from '@material-ui/icons/Check';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import LockOpen from "@material-ui/icons/LockOpen";
import DateRange from "@material-ui/icons/DateRange";
import LocalOffer from "@material-ui/icons/LocalOffer";
import Update from "@material-ui/icons/Update";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import AccessTime from "@material-ui/icons/AccessTime";
import Accessibility from "@material-ui/icons/Accessibility";
import BugReport from "@material-ui/icons/BugReport";
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import Code from "@material-ui/icons/Code";
import Cloud from "@material-ui/icons/Cloud";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Table from "components/Table/Table.js";
import ProposalTable from "components/ProposalTable/ProposalTable.js";
import Tasks from "components/Tasks/Tasks.js";
import CustomTabs from "components/CustomTabs/CustomTabs.js";
import Danger from "components/Typography/Danger.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardIcon from "components/Card/CardIcon.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";
import { Link } from "react-router-dom"

import getWeb3 from "../../utils/getWeb3";
import Web3 from "web3";
import RegulatorContract from "../../contracts/Regulator.json";
import ISAFactoryContract from "../../contracts/ISAFactory.json";
import ProposalContract from "../../contracts/Proposal.json";

import { bugs, website, server } from "variables/general.js";

import {
  dailySalesChart,
  emailsSubscriptionChart,
  completedTasksChart
} from "variables/charts.js";

import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";

const useStyles = makeStyles(styles);

export default function Dashboard() {
  const classes = useStyles();

  const [ web3, setWeb3 ] = useState(null);
  const [ regulatorContract, setRegulatorContract] = useState(null);
  const [ isaFactoryContract, setIsaFactoryContract] = useState(null);
  const [ accounts, setAccounts ] = useState(null);
  const [ currentAccount, setCurrentAccount ] = useState(null);
  const [ isRegistered, setIsRegistered ] = useState(null)
  const [ proposals, setProposals ] = useState(null)

  useEffect(() => {
    console.log("connecting to Regulator instance")
    const init = async() => {
      try {
        const web3 = new Web3(window.ethereum);
        console.log("connected to web3 instance")
        const networkId = await web3.eth.net.getId();
        const regulatorDeployedNetwork = RegulatorContract.networks[networkId];
        const isaFactoryDeployedNetwork = ISAFactoryContract.networks[networkId];
        const accounts = await web3.eth.getAccounts();
        const regulatorInstance = new web3.eth.Contract(
          RegulatorContract.abi,
          regulatorDeployedNetwork && regulatorDeployedNetwork.address,
        );
        const isaFactoryInstance = new web3.eth.Contract(
          ISAFactoryContract.abi,
          isaFactoryDeployedNetwork && isaFactoryDeployedNetwork.address,
        );
        console.log("connected to Regulator contract")

        setWeb3(web3)
        setRegulatorContract(regulatorInstance)
        console.log(regulatorInstance)
        setIsaFactoryContract(isaFactoryInstance)
        console.log(isaFactoryInstance)
        setAccounts(accounts)
        setCurrentAccount(accounts[0])
        console.log("currentAccount: " + accounts[0])
        const registered = await regulatorInstance.methods.getConfirmedIdentity().call( {from: accounts[0] })
        console.log("registered? " + registered)
        setIsRegistered(registered)

        const proposals = await PendingProposalData(isaFactoryInstance, web3)
        console.log(proposals)
        setProposals(proposals)

        // if (await isaFactoryInstance.methods.getAllProposalNumber().call( {from: accounts[0]}) > 0) {
        //   console.log("hello")
        //   const isa = await isaFactoryInstance.methods.getAllProposals().call( {from: accounts[0]})
        //   const instance = new web3.eth.Contract(
        //     ProposalContract.abi,
        //     isa[0]
        //   );
        //   console.log(await instance.methods.lenderAddress().call())
        // }
      } catch(error) {
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
      }
    }

    init();
  }, []);

  async function PendingProposalData(isaFactoryInstance, web3) {
    if (await isaFactoryInstance.methods.getAllProposalNumber().call() > 0) {
      console.log("hello")
      var allProposals = []
      const proposals = await isaFactoryInstance.methods.getAllProposals().call()
      console.log(proposals)
      for (var i = 0 ; i < proposals.length ; i++) {
        var proposal = []
        const instance = new web3.eth.Contract(
          ProposalContract.abi,
          proposals[i]
        );
        proposal.push(await instance.methods.lenderAddress().call())
        proposal.push(await instance.methods.borrowerAddress().call())
        proposal.push("$" + await instance.methods.isaAmount().call())
        proposal.push(await instance.methods.incomePercentage().call() + "%")
        proposal.push(await instance.methods.timePeriod().call() + " months")
        allProposals.push(proposal)
      }
      return allProposals
    } else {
      return ([
        ["1", "0x1d11E4335012202E17adf951155F78dEEBBFDCa4", "$36,000", "30%"],
        ["2", "0x7C930023700702CdF3c4C22E33b705C92fd08AC3", "$23,000", "20%"]
      ])
    }
  }

  function Registered(props) {
    if (isRegistered) {
      return <RegisteredCard />
    } else {
      return <UnregisteredCard />
    }
  }

  function RegisteredCard(props) {
    return (
      <Card>
        <CardHeader color="success" stats icon>
          <CardIcon color="success">
            <Icon>check</Icon>
          </CardIcon>
          <p className={classes.cardCategory}>Account Registered</p>
          <h3 className={classes.cardTitle}>
            {currentAccount}
          </h3>
        </CardHeader>
      </Card>
    )
  }

  function UnregisteredCard(props) {
    return (
      <Card>
        <CardHeader color="danger" stats icon>
          <CardIcon color="danger">
            <Icon>close</Icon>
          </CardIcon>
          <p className={classes.cardCategory}>Account Unregistered</p>
          <h3 className={classes.cardTitle}>
            {currentAccount}
          </h3>
        </CardHeader>
        <CardFooter stats>
          <div className={classes.stats}>
            <Danger>
              <LockOpen />
            </Danger>
              <a href="/admin/Register">
              Register Account
            </a>
          </div>
        </CardFooter>
      </Card>
    )
  }



  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={9}>
          <Registered />
        </GridItem>
      </GridContainer>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <CustomTabs
            title="Proposals:"
            headerColor="info"
            tabs={[
              {
                tabName: "Pending",
                tabIcon: HourglassEmptyIcon,
                tabContent: (
                  <ProposalTable
                    tableHeaderColor="info"
                    tableHead={["Lender", "Borrower", "ISA Amount", "Income Percentage", "ISA Period"]}
                    tableData={proposals}
                    isRegistered={isRegistered}
                    web3={web3}
                  />
                )
              },
              {
                tabName: "Signed",
                tabIcon: CheckIcon,
                tabContent: (
                  <ProposalTable
                    tableHeaderColor="info"
                    tableHead={["ID", "Address", "Amount", "Percentage"]}
                    tableData={[
                      ["1", "0x1d11E4335012202E17adf951155F78dEEBBFDCa4", "$36,000", "30%"],
                      ["2", "0x7C930023700702CdF3c4C22E33b705C92fd08AC3", "$23,000", "20%"]
                    ]}
                    isRegistered={isRegistered}
                  />
                )
              },
            ]}
          />
        </GridItem>
      </GridContainer>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <CustomTabs
            title="Income Sharing Agreements:"
            headerColor="info"
            tabs={[
              {
                tabName: "Borrower",
                tabIcon: ArrowUpwardIcon,
                tabContent: (
                  <ProposalTable
                    tableHeaderColor="info"
                    tableHead={["ID", "Address", "Amount", "Percentage", "Total Paid"]}
                    tableData={[
                      ["1", "0x1d11E4335012202E17adf951155F78dEEBBFDCa4", "$36,000", "30%", "$1,000"],
                      ["2", "0x7C930023700702CdF3c4C22E33b705C92fd08AC3", "$23,000", "20%", "14,000"]
                    ]}
                    isRegistered={isRegistered}
                  />
                )
              },
              {
                tabName: "Lender",
                tabIcon: ArrowDownwardIcon,
                tabContent: (
                  <ProposalTable
                    tableHeaderColor="info"
                    tableHead={["ID", "Address", "Amount", "Percentage", "Total Paid"]}
                    tableData={[
                      ["1", "0x1d11E4335012202E17adf951155F78dEEBBFDCa4", "$36,000", "30%", "$1,000"],
                      ["2", "0x7C930023700702CdF3c4C22E33b705C92fd08AC3", "$23,000", "20%", "14,000"]
                    ]}
                    isRegistered={isRegistered}
                  />
                )
              },
            ]}
          />
        </GridItem>
      </GridContainer>
    </div>
  );
}
