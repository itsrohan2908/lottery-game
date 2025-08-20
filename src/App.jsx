import './App.css'
import { sum } from './helper';
import Lottery from './Lottery'
import TicketNum from './TicketNum';

function App() {

  let winCondition = (ticket) => {
    return sum(ticket) === 15;
  }

  return (
    <>
      <Lottery n={3} winningSum={16} winCondition={winCondition} />
    </>
  )
}

export default App;