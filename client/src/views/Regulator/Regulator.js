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
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import AccessTime from "@material-ui/icons/AccessTime";
import Accessibility from "@material-ui/icons/Accessibility";
import BugReport from "@material-ui/icons/BugReport";
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import Code from "@material-ui/icons/Code";
import Cloud from "@material-ui/icons/Cloud";
import AddIcon from '@material-ui/icons/Add';
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Table from "components/Table/Table.js";
import RegulatorTable from "components/RegulatorTable/RegulatorTable.js";
import RegulatorTransferTable from "components/RegulatorTransferTable/RegulatorTransferTable.js"
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

  useEffect(() => {
    const init = async() => {
      try {
        // const web3Instance = new Web3(window.ethereum);
        const web3Instance = new Web3(window.ethereum);
        const networkId = await web3Instance.eth.net.getId();
        const regulatorDeployedNetwork = RegulatorContract.networks[networkId];
        const isaFactoryDeployedNetwork = ISAFactoryContract.networks[networkId];
        const accounts = await web3Instance.eth.getAccounts();
        const regulatorInstance = new web3Instance.eth.Contract(
          RegulatorContract.abi,
          regulatorDeployedNetwork && regulatorDeployedNetwork.address,
        );
        const isaFactoryInstance = new web3Instance.eth.Contract(
          ISAFactoryContract.abi,
          isaFactoryDeployedNetwork && isaFactoryDeployedNetwork.address,
        );

        setWeb3(web3Instance)
        setRegulatorContract(regulatorInstance)
        setIsaFactoryContract(isaFactoryInstance)
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


  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <CustomTabs
            title="ISAs:"
            headerColor="info"
            tabs={[
              {
                tabName: "Create",
                tabIcon: AddIcon,
                tabContent: (
                  <RegulatorTable
                    tableHeaderColor="info"
                    tableHead={["Symbol", "Lender", "Borrower", "ISA Amount", "Income Percentage", "ISA Period"]}
                  />
                )
              },
              {
                tabName: "Transfer",
                tabIcon: ArrowForwardIcon,
                tabContent: (
                  <RegulatorTransferTable
                    tableHeaderColor="info"
                    tableHead={["Symbol", "Seller", "Tokens", "Cost"]}
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
