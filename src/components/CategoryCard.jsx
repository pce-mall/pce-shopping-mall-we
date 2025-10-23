export default function CategoryCard({icon, title, text}){
  return (
    <div className="card">
      <div style={{fontSize:"24px"}}>{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
