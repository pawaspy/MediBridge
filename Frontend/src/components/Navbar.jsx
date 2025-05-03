import styled from '@emotion/styled'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import removedBgMedibridge from '../removed-bg-medibridge.png'

const NavWrapper = styled(motion.div)`
  position: fixed;
  z-index: 1000;
  display: flex;
  justify-content: center;
  transition: all 0.5s ease-in-out;
`

const Nav = styled(motion.nav)`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(24px);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  margin: 0 auto;
  min-width: 0;
  width: auto;
  transition: all 0.5s ease-in-out;
`

const Logo = styled(motion(Link))`
  font-size: 1.5rem;
  font-weight: bold;
  color: #00FFAB;
  letter-spacing: 1px;
  flex-shrink: 0;
  white-space: nowrap;
`

const NavLinks = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 2rem;
  transition: all 0.5s ease-in-out;
`

const NavLink = styled(motion(Link))`
  color: #22223b;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0.4rem 1.2rem;
  border-radius: 2rem;
  transition: background 0.2s, color 0.2s;
  white-space: nowrap;
  &:hover {
    background: #00FFAB22;
    color: #00CC89;
  }
`

const Button = styled(motion.button)`
  background: #00FFAB;
  color: #22223b;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 2rem;
  cursor: pointer;
  font-weight: 700;
  text-decoration: none;
  display: inline-block;
  font-size: 1.1rem;
  margin-left: 1.5rem;
  box-shadow: 0 2px 8px 0 rgba(0,255,171,0.08);
  transition: background 0.2s, color 0.2s;
  white-space: nowrap;
  &:hover {
    background: #00CC89;
    color: #fff;
  }
`

export function Navbar({ animateLeft }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVertical, setIsVertical] = useState(() => {
    // Initialize from sessionStorage or false if not found
    return sessionStorage.getItem('navbarLayout') === 'vertical';
  });

  // Update sessionStorage when layout changes
  useEffect(() => {
    if (isVertical) {
      sessionStorage.setItem('navbarLayout', 'vertical');
    } else {
      sessionStorage.setItem('navbarLayout', 'horizontal');
    }
  }, [isVertical]);

  // Reset to horizontal when navigating away from register
  useEffect(() => {
    if (!location.pathname.includes('register') && isVertical) {
      setIsVertical(false);
    }
  }, [location.pathname]);

  const handleLoginClick = (e) => {
    e.preventDefault();
    setIsVertical(true);
    setTimeout(() => {
      navigate('/register');
    }, 100);
  };

  const wrapperVariants = {
    horizontal: {
      top: '2rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
    },
    vertical: {
      top: 0,
      left: 0,
      height: '100vh',
      width: '280px',
      transform: 'none',
    }
  };

  const navVariants = {
    horizontal: {
      flexDirection: 'row',
      padding: '0.75rem 2rem',
      borderRadius: '2.5rem',
      maxWidth: '1400px',
      margin: '0 auto',
      justifyContent: 'space-between',
    },
    vertical: {
      flexDirection: 'column',
      padding: '3rem 1.5rem',
      borderRadius: '0',
      height: '100vh',
      width: '100%',
      margin: 0,
      alignItems: 'flex-start',
    }
  };

  const linksVariants = {
    horizontal: {
      flexDirection: 'row',
      marginLeft: '2.5rem',
      alignItems: 'center',
      flex: 1,
      justifyContent: 'flex-end',
    },
    vertical: {
      flexDirection: 'column',
      marginLeft: 0,
      marginTop: '3rem',
      width: '100%',
      gap: '1.5rem',
      alignItems: 'flex-start',
    }
  };

  const linkVariants = {
    horizontal: {},
    vertical: {
      width: '100%',
      textAlign: 'left',
      fontSize: '1.2rem',
    }
  };

  const buttonVariants = {
    horizontal: {
      marginLeft: '1.5rem',
      alignSelf: 'center',
    },
    vertical: {
      marginLeft: 0,
      marginTop: '2rem',
      width: '100%',
      alignSelf: 'flex-start',
    }
  };

  return (
    <AnimatePresence>
      <NavWrapper
        initial={animateLeft ? { x: '-100vw', opacity: 0 } : false}
        animate={animateLeft ? { x: 0, opacity: 1 } : (isVertical ? 'vertical' : 'horizontal')}
        exit={animateLeft ? { x: '-100vw', opacity: 0 } : false}
        variants={wrapperVariants}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
      >
        <Nav
          initial={false}
          animate={isVertical ? 'vertical' : 'horizontal'}
          variants={navVariants}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <Logo as={Link} to="/">
            <img src={removedBgMedibridge} alt="MediBridge Logo" style={{ height: '40px', width: 'auto', display: 'block' }} />
          </Logo>
          <NavLinks
            initial={false}
            animate={isVertical ? 'vertical' : 'horizontal'}
            variants={linksVariants}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <NavLink
              to="/"
              variants={linkVariants}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsVertical(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              variants={linkVariants}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsVertical(false)}
            >
              About
            </NavLink>
            <NavLink
              to="/services"
              variants={linkVariants}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsVertical(false)}
            >
              Services
            </NavLink>
            <Button
              variants={buttonVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLoginClick}
              animate={isVertical ? 'vertical' : 'horizontal'}
            >
              Sign Up / Login
            </Button>
          </NavLinks>
        </Nav>
      </NavWrapper>
    </AnimatePresence>
  );
} 

export default Navbar