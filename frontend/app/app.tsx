import './styles/app.css'
import ContentArea from './components/custom/ContentArea'
import Sidebar from './components/custom/Sidebar'
import Header from './components/layout/Header'

export default function App() {
  return (
    <div className="flex flex-row w-full">
      <Sidebar />
      <div className="flex flex-col w-full h-full ">
        <Header />
        <ContentArea />
      </div>
    </div>
  )
}
