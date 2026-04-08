import React from 'react';
import { Link } from 'react-router-dom';

const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    // Removed History tab
];

const Header = () => {
    return (
        <header>
            <nav>
                <ul>
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <Link to={item.path}>{item.name}</Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
};

export default Header;
