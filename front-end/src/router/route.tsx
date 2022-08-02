import {Routes, Route} from 'react-router-dom'
import IndexPage from '../pages/index.page'
import LoanPage from '../pages/loan.page'
import WalletPage from '../pages/wallet.page'
import SocialMedia from '../pages/media.page'

type Props = {
    currentAddress: string
}
export default function AppRouter(props: Props){
    return (
        <Routes>
            <Route path='/' element = {<IndexPage currentAddress={props.currentAddress}/>}/>
            <Route path='/wallet' element = {<WalletPage />}/>
            <Route path='/loan' element={<LoanPage />}/>
            <Route path='/media' element={<SocialMedia />} />
        </Routes>
    )
}