import '../styles/globals.css'
import "../styles/app.css"
// import './app.css'
import Link from 'next/link' //Allow quick create a navigation

function ReeaNFTApp({ Component, pageProps }) {
  return (
    <div> 
      <nav className="border-b p-6" style={{backgroundColor:"orange"}}>
        <p className='text-4x1 font-bold text-white'>REEA NFT MarketPlace</p>
        <div className='flex mt-4 justify-center'>
          <Link href="/">
            <a className='mr-4'>
              Home
            </a>
          </Link>
          <Link href="/mint-item">
            <a className='mr-6'>
              Mint Tokens
            </a>
          </Link>
          <Link href="/my-nfts">
            <a className='mr-6'>
              My NFTs
            </a>
          </Link>
          <Link href="/account-dasboard">
            <a className='mr-6'>
              Account Dashboard
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>

  );
  // return <Component {...pageProps} />
}

export default ReeaNFTApp
