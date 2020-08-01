import React from 'react';
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

const emails = ['username@gmail.com', 'user02@gmail.com'];
const useStyles = makeStyles({
  avatar: {
    backgroundColor: blue[100],
    color: blue[600],
  }
});

export default function ProposalDialog(props) {
  const classes = useStyles();
  const { onClose, selectedValue, open } = props;

  const [ web3, setWeb3 ] = useState(null);
  const [ regulatorContract, setRegulatorContract] = useState(null);
  const [ isaFactoryContract, setIsaFactoryContract] = useState(null);
  const [ accounts, setAccounts ] = useState(null);
  const [ currentAccount, setCurrentAccount ] = useState(null);
  const [ isRegistered, setIsRegistered ] = useState(null)
  const [ proposals, setProposals ] = useState(null)

  useEffect(() => {
    console.log("connecting to ISA Factory instance")
    const init = async() => {
      try {
        const web3 = new Web3(window.ethereum);
        console.log("connected to web3 instance")
        const networkId = await web3.eth.net.getId();
        const isaFactoryDeployedNetwork = ISAFactoryContract.networks[networkId];
        const accounts = await web3.eth.getAccounts();
        const isaFactoryInstance = new web3.eth.Contract(
          ISAFactoryContract.abi,
          isaFactoryDeployedNetwork && isaFactoryDeployedNetwork.address,
        );
        console.log("connected to ISA Factory contract")

        setWeb3(web3)
        setIsaFactoryContract(isaFactoryInstance)
        setAccounts(accounts)
        setCurrentAccount(accounts[0])

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

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = (value) => {
    onClose(value);
  };

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle id="simple-dialog-title">Set backup account</DialogTitle>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="info">
              <h4 className={classes.cardTitleWhite}>Simple Table</h4>
              <p className={classes.cardCategoryWhite}>
                Here is a subtitle for this table
              </p>
            </CardHeader>
            <CardBody>
              <ProposalDialogTable
                tableHeaderColor="info"
                tableData={[
                  ["Dakota Rice", "Niger"],
                  ["Minerva Hooper", "Curaçao"],
                  ["Sage Rodriguez", "Netherlands"],
                  ["Philip Chaney", "Korea, South"],
                  ["Doris Greene", "Malawi"],
                  ["Mason Porter", "Chile"]
                ]}
              />
            </CardBody>
            <CardActions>
              <Button onClick={() => {console.log("Hi")}} color="success">Accept</Button>
              <Button onClick={() => {console.log("Hi")}} color="danger">Reject</Button>
            </CardActions>
          </Card>
        </GridItem>
      </GridContainer>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <CardHeader color="info">
            <h4 className={classes.cardTitleWhite}>Simple Table</h4>
          </CardHeader>
        </GridItem>
      </GridContainer>
    </Dialog>
  );
}

ProposalDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  selectedValue: PropTypes.string.isRequired,
};
