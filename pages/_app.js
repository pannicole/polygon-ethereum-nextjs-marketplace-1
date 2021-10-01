import '../styles/globals.css'
import Link from 'next/link'
import Box from "@material-ui/core/Box";
import AppBar from "@material-ui/core/AppBar";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";
import AttachMoneyIcon from "@material-ui/icons/AttachMoney";
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import DashboardIcon from "@material-ui/icons/Dashboard";

const useStyles = makeStyles((theme) => ({
  navBar: {
    backgroundColor: "white",
    color: "black",
    padding: "10px",
    margin: "10px",
    textAlign: "center",
  },
  title:{
    fontFamily: "reenie",
    fontSize: "50px"
  },
  link:{
    margin: "10px"
  }
}));

function Marketplace({ Component, pageProps }) {
  const muiClasses = useStyles();
  return (
    <Box sx= {{flexGrow: 1}}>
      <AppBar className={muiClasses.navBar}
        position = "static">
        <div style={{display: "flex", alignItems: "center"}}>
          <div style= {{minWidth: "400px"}}>
            <Link href="/">
              <a className = {muiClasses.title}>
              Scribblez Marketplace
              </a>
            </Link>
          </div>
          <div style ={{flexGrow: 1, display: "flex", justifyContent: "flex-end", marginRight: "10px"}}>
            <Link href="/create-item">
              <a className={muiClasses.link}>
                <AttachMoneyIcon />
                Sell Digital Asset
              </a>
            </Link>
            <Link href="/my-assets">
              <a className={muiClasses.link}>
                <AccountBalanceWalletIcon />
                 My Digital Assets
              </a>
            </Link>
            <Link href="/creator-dashboard">
              <a className={muiClasses.link}>
                <DashboardIcon/>
                Creator Dashboard
              </a>
            </Link>
          </div>
        </div>
      </AppBar>
      <Component {...pageProps} />
    </Box>
  )
}

export default Marketplace
