import CategoryCard from "../components/CategoryCard";

const data = [
  { icon:"👕", title:"Fashion", text:"Clothing, shoes, bags" },
  { icon:"📱", title:"Electronics", text:"Phones, laptops, accessories" },
  { icon:"💄", title:"Beauty", text:"Skincare & cosmetics" },
  { icon:"🏠", title:"Home & Kitchen", text:"Appliances & utensils" },
  { icon:"🧒", title:"Baby", text:"Diapers, toys & care" },
  { icon:"🎮", title:"Gaming", text:"Consoles & controllers" }
];

export default function Categories(){
  return (
    <section className="section">
      <h2>Browse Categories</h2>
      <p className="lead">Pick a category and place your order via WhatsApp. Full store coming soon.</p>
      <div className="grid">
        {data.map((c) => (
          <CategoryCard key={c.title} {...c} />
        ))}
      </div>
      <div style={{marginTop:16}}>
        <a className="btn btn-primary" href="https://wa.me/2347089724573" target="_blank" rel="noreferrer">Order via WhatsApp</a>
      </div>
    </section>
  );
}
