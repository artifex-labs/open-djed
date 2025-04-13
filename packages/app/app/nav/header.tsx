import { Link, NavLink } from "react-router"

export const Header = () => {
  return (
    <header className="flex-column flex items-center justify-between py-4 px-4">
      <Link to="/"><div className="align-left text-xl flex flex-column"><img src='/reverse-djed.svg' alt='Reverse DJED' />Reverse DJED</div></Link>
      <nav>
        <ul className="flex-column flex items-center justify-between">
          <li className="m-3"><NavLink to="/">Home</NavLink></li>
          <li className="m-3"><NavLink to="/djed">DJED</NavLink></li>
          <li className="m-3"><NavLink to="/shen">SHEN</NavLink></li>
        </ul>
      </nav>
      <div className="align-right">WALLET HERE, SETTINGS HERE</div>
    </header>
  )
}