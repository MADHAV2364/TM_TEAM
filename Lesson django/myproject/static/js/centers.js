document.addEventListener('DOMContentLoaded', () => {
    const centerData = [
        { id: 1, name: 'Ewri Recyclers', address: '123 Green Street, Metropolis', lat: 34.0522, lng: -118.2437, image: 'https://i.pinimg.com/1200x/49/70/ee/4970ee85ec5746e6f5b6aebd5ee0c945.jpg' },
        { id: 2, name: 'Urban E-Cycle', address: '456 Oak Avenue, Cityville', lat: 34.0522, lng: -118.2437, image: 'https://i.pinimg.com/736x/76/cd/7c/76cd7cca77e82dd2050f36bd62c15b82.jpg' },
        { id: 3, name: 'Sustainable Solutions', address: '789 Pine Lane, Suburbia', lat: 34.0522, lng: -118.2437, image: 'https://i.pinimg.com/736x/9c/bf/86/9cbf86025eaca3a67fbbf898ba4f8969.jpg' },
        { id: 4, name: 'Eco-Friendly Disposal', address: '101 River Road, Downtown', lat: 34.0522, lng: -118.2437, image: 'https://i.pinimg.com/736x/d6/4e/57/d64e57b57369a25cd10774a99935997b.jpg' },
        { id: 5, name: 'Green Gadget Recycling', address: '202 Forest Drive, Tech Park', lat: 34.0522, lng: -118.2437, image: 'https://i.pinimg.com/736x/45/52/d1/4552d1319ff03dad108ba4c749385728.jpg' },
        { id: 6, name: 'Digital Decommissioners', address: '303 Mountain View, Hillside', lat: 34.0522, lng: -118.2437, image: 'https://i.pinimg.com/1200x/63/e0/1d/63e01da2df09f359622afd42ba53f84a.jpg' }
    ];

    const centersContainer = document.getElementById('centers-container');
    const modal = document.getElementById('center-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModalBtn = document.getElementById('close-modal');

    function renderCards(centers) {
        centersContainer.innerHTML = '';
        centers.forEach(center => {
            const card = document.createElement('div');
            card.classList.add('center-card');
            card.dataset.centerId = center.id;
            card.innerHTML = `
                <img src="${center.image}" class="center-card-image" alt="${center.name}">
                <h3 class="center-card-title">${center.name}</h3>
                <p class="center-card-address">${center.address}</p>
                <p class="center-card-details-link">Click for more details</p>
            `;
            centersContainer.appendChild(card);
        });
                
        attachCardEventListeners();
    }

    function attachCardEventListeners() {
        document.querySelectorAll('.center-card').forEach(card => {
            card.addEventListener('click', () => {
                const centerId = card.dataset.centerId;
                const center = centerData.find(c => c.id == centerId);
                if (center) {
                    modalContent.innerHTML = `
                        <h2>${center.name}</h2>
                        <p><strong>Address:</strong> ${center.address}</p>
                        <p><strong>Hours:</strong> Mon-Fri: 9:00 AM - 5:00 PM</p>
                        <p><strong>Phone:</strong> (555) 123-4567</p>
                        <h3>Services:</h3>
                        <ul>
                            <li>Electronics Recycling</li>
                            <li>Data Destruction</li>
                            <li>Battery Drop-off</li>
                        </ul>
                    `;
                    modal.style.display = 'flex';
                }
            });
        });
    }

    // Render all centers directly on load
    renderCards(centerData);

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside of it
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});