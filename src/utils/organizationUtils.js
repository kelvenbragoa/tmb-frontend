/**
 * Utility functions for organization data management
 */

/**
 * Get current user from localStorage
 * @returns {Object|null} User object or null if not found
 */
export const getCurrentUser = () => {
    try {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        return null;
    }
};

/**
 * Get organization data from current user
 * @returns {Object} Organization data with fallback values
 */
export const getOrganizationData = () => {
    const user = getCurrentUser();
    const organization = user?.organization;
    
    if (!organization) {
        // Fallback data
        return {
            name: 'DYNAMIS',
            description: 'Sistema de Gestão Comercial',
            address: 'Maputo, Moçambique',
            email: '',
            mobile: '',
            nuit: '',
            city: 'Maputo'
        };
    }

    return {
        name: organization.name || 'DYNAMIS',
        description: 'Sistema de Gestão Comercial',
        address: organization.address || 'Maputo, Moçambique',
        email: organization.email || '',
        mobile: organization.mobile || '',
        nuit: organization.nuit || '',
        city: organization.city || 'Maputo'
    };
};

/**
 * Format organization info for display
 * @returns {Object} Formatted organization info
 */
export const getFormattedOrganizationInfo = () => {
    const org = getOrganizationData();
    
    return {
        title: org.name,
        subtitle: org.description,
        location: `${org.city}${org.address && org.address !== org.city ? `, ${org.address}` : ''}`,
        contact: [org.email ? `Email: ${org.email}` : '', org.mobile ? `Tel: ${org.mobile}` : '', org.nuit ? `NUIT: ${org.nuit}` : ''].filter(Boolean) // Remove empty strings
    };
};