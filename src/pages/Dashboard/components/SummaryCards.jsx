import SummaryCard from '../../../components/crud/SummaryCard.jsx';

export default function SummaryCards({ cards }) {
  return (
    <div className="row col-3">
      {cards.map((c) => (
        <SummaryCard key={c.label} {...c} />
      ))}
    </div>
  );
}
