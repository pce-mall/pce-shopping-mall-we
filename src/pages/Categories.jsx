export default function Categories() {
  const items = ['Fashion', 'Electronics', 'Beauty', 'Home & Kitchen', 'Baby Products']
  return (
    <section style={{ padding: '20px' }}>
      <h2>Our Categories</h2>
      <ul>
        {items.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </section>
  )
}
