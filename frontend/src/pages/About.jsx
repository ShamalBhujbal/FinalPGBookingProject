import React from 'react';
import { FaLinkedin, FaGithub, FaEnvelope, FaUserTie, FaCode, FaLaptopCode } from 'react-icons/fa';

const TeamMemberCard = ({ name, role, isLead = false }) => (
    <div className="card" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '2rem',
        borderTop: isLead ? '4px solid var(--primary)' : '1px solid var(--border)',
        transform: isLead ? 'scale(1.05)' : 'none',
        zIndex: isLead ? 2 : 1
    }}>
        <div style={{
            width: '100px',
            height: '100px',
            background: isLead ? 'linear-gradient(135deg, var(--primary), var(--primary-hover))' : '#e2e8f0',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            fontSize: '3rem',
            color: isLead ? 'white' : 'var(--text-muted)'
        }}>
            {isLead ? <FaUserTie /> : <FaCode />}
        </div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.2rem', color: 'var(--text-main)' }}>{name}</h3>
        <p style={{ color: isLead ? 'var(--primary)' : 'var(--text-muted)', fontWeight: isLead ? '600' : '400', marginBottom: '1.5rem' }}>{role}</p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
            <a href="#" style={{ color: '#0077b5', fontSize: '1.2rem' }}><FaLinkedin /></a>
            <a href="#" style={{ color: '#333', fontSize: '1.2rem' }}><FaGithub /></a>
            <a href="#" style={{ color: '#ea4335', fontSize: '1.2rem' }}><FaEnvelope /></a>
        </div>
    </div>
);

const About = () => {
    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '3rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Meet Our Team</h1>
                <p style={{ maxWidth: '700px', margin: '0 auto', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                    The passionate minds behind Area Stay Point, dedicated to simplifying your search for the perfect PG accommodation.
                </p>
            </div>

            {/* Project Lead */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
                <div style={{ maxWidth: '400px', width: '100%' }}>
                    <TeamMemberCard
                        name="Shamal Bhujbal"
                        role="Project Lead & Full Stack Developer"
                        isLead={true}
                    />
                </div>
            </div>

            {/* Team Members Grid */}
            <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--secondary)' }}>Core Team Members</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                <TeamMemberCard name="Siddhi Adkitte" role="Team Member" />
                <TeamMemberCard name="Yash Patil" role="Team Member" />
                <TeamMemberCard name="Afsha Khan" role="Team Member" />
                <TeamMemberCard name="Akash Kokulwar" role="Team Member" />
            </div>

            {/* Vision Section */}
            <div style={{ marginTop: '5rem', background: 'white', padding: '3rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', textAlign: 'center' }}>
                <FaLaptopCode style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }} />
                <h2 style={{ marginBottom: '1rem' }}>Our Vision</h2>
                <p style={{ color: 'var(--text-muted)', maxWidth: '800px', margin: '0 auto' }}>
                    To create a seamless, transparent, and efficient platform that connects PG owners with seekers,
                    fostering a community of trust and convenience. We believe finding a home away from home should be effortless.
                </p>
            </div>
        </div>
    );
};

export default About;
