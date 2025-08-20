import TicketNum from "./TicketNum";
import "./Ticket.css"

export default function Ticket({ticket, isWinning}){
	return(
		<div className={`ticket${isWinning ? ' ticket--win' : ''}`}>
			<p>Ticket</p>
			<div className="ticket-row">
				{ticket.map((num, index) => (
					<TicketNum num={num} key={index} />
				))}
			</div>
		</div>
	)
}