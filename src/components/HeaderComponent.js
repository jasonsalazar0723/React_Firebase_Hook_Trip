import React, {useContext} from 'react';
import '../styles/Header.css';
import { Link, NavLink } from 'react-router-dom';
import { modalContext } from '../context/modal';

const Header = () => {
    const setIsModalOpen = useContext(modalContext);

    return (
            <div className="header">
                <ul className="navlist">
                    <Link to="/home" className="logo"><img src="/assets/images/logo.png" /></Link>
                    <li><NavLink to="/home" className="navitem">Home</NavLink></li>
                    <li><NavLink to="/about" className="navitem">About</NavLink></li>
                    <li className="navitem-equipment"><NavLink to="/equipmentlistsearch" className="navitem dropbtn">Equipment Lists</NavLink>
                        <ul class="equipment-dropdown">
                            <li><NavLink to="/equipmentlistsearch" className="equipment-dropdown-item">Search Equipment List</NavLink></li>
                            <li><NavLink to="/equipmentlist" className="equipment-dropdown-item">Add Equipment List</NavLink></li>
                        </ul>
                    </li>
                    <li><NavLink to="/activitysearch" className="navitem">Activities</NavLink></li>
                    <li><NavLink to="/contact" className="navitem">Contact</NavLink></li>
                    <li><NavLink to="/mytrip" className="button-plan">Plan Your Trip!</NavLink></li>
                        <li><button className="button-login" onClick={() => setIsModalOpen(true)}>
                        <i className="fa fa-lg fa-user"></i>
                    </button>
                    </li>
                </ul>
            </div>
    );
};

export default Header;