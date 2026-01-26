const Footer = () => {
    return (
        <footer style={{
            backgroundColor: 'var(--secondary)',
            color: 'white',
            padding: '2rem 0',
            marginTop: 'auto'
        }}>
            <div className="container" style={{ textAlign: 'center' }}>
                <p>&copy; {new Date().getFullYear()} PG Finder. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
