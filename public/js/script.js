const API_BASE_URL = 'https://api-instagram-rscoders.vercel.app/';

window.addEventListener('load', function() {
    setTimeout(function() {
        document.getElementById('loading').style.opacity = '0';
        setTimeout(function() {
            document.getElementById('loading').style.display = 'none';
        }, 500);
    }, 1000);
});

const observeElements = () => {
    const featureCards = document.querySelectorAll('.feature-card');
    const stepCards = document.querySelectorAll('.step-card');
    const infoCards = document.querySelectorAll('.info-card');
    
    if (!('IntersectionObserver' in window)) {
        featureCards.forEach(card => card.classList.add('visible'));
        stepCards.forEach(card => card.classList.add('visible'));
        infoCards.forEach(card => card.classList.add('visible'));
        return;
    }
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    featureCards.forEach(card => observer.observe(card));
    stepCards.forEach(card => observer.observe(card));
    infoCards.forEach(card => observer.observe(card));
};

async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        const input = document.getElementById('instagram-url');
        input.value = text.trim();
        input.classList.add('paste-effect');
        setTimeout(() => input.classList.remove('paste-effect'), 800);
        updateInputIcon();
        input.focus();
    } catch (err) {
        showError('Failed to read clipboard. Please paste manually.');
    }
}

function updateInputIcon() {
    const input = document.getElementById('instagram-url');
    const pasteBtn = document.getElementById('paste-btn');
    const icon = pasteBtn.querySelector('i');
    
    if (input.value.trim()) {
        icon.className = 'fas fa-times';
        pasteBtn.setAttribute('title', 'Clear URL');
        pasteBtn.setAttribute('aria-label', 'Clear URL');
    } else {
        icon.className = 'fas fa-paste';
        pasteBtn.setAttribute('title', 'Paste from clipboard');
        pasteBtn.setAttribute('aria-label', 'Paste URL');
    }
}

function handleIconClick() {
    const input = document.getElementById('instagram-url');
    
    if (input.value.trim()) {
        clearInput();
    } else {
        pasteFromClipboard();
    }
}

function isValidInstagramURL(url) {
    const pattern = /^https:\/\/.*instagram\.com\/.+/;
    return pattern.test(url);
}

function clearInput() {
    const input = document.getElementById('instagram-url');
    const errorMessage = document.getElementById('error-message');
    const resultContainer = document.getElementById('result-container');
    const noResultContainer = document.getElementById('no-result-container');
    const downloadSection = document.querySelector('.download-section');
    const featuresSection = document.querySelector('.features-section');
    const howToSection = document.querySelector('.how-to-section');
    
    input.value = '';
    errorMessage.classList.remove('active');
    resultContainer.style.display = 'none';
    if (noResultContainer) {
        noResultContainer.style.display = 'none';
    }
    downloadSection.style.display = 'block';
    featuresSection.classList.remove('hidden');
    howToSection.classList.remove('hidden');
    updateInputIcon();
    input.focus();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleDownload() {
    const input = document.getElementById('instagram-url');
    let url = input.value.trim();
    
    if (!url) {
        showError('Please enter an Instagram URL!');
        return;
    }
    
    if (!isValidInstagramURL(url)) {
        showError('Invalid Instagram URL! Please enter a valid Instagram link.');
        return;
    }
    
    getInstagramData(url);
}

function getInstagramData(url) {
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');
    const resultContainer = document.getElementById('result-container');
    const noResultContainer = document.getElementById('no-result-container');
    
    loader.classList.add('active');
    errorMessage.classList.remove('active');
    resultContainer.style.display = 'none';
    if (noResultContainer) {
        noResultContainer.style.display = 'none';
    }
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', API_BASE_URL + 'api/download?url=' + encodeURIComponent(url), true);
    
    xhr.onload = function() {
        loader.classList.remove('active');
        
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const response = JSON.parse(xhr.responseText);
                
                if (response.status && response.result) {
                    displayResult(response.result);
                } else {
                    showNoResult(response.message);
                }
            } catch (e) {
                showNoResult('Failed to parse response data!');
            }
        } else {
            showNoResult('Please check your Instagram link!');
        }
    };
    
    xhr.onerror = function() {
        loader.classList.remove('active');
        showNoResult('Network error occurred. Please check your connection.');
    };
    
    xhr.send();
}

function displayResult(results) {
    const resultContainer = document.getElementById('result-container');
    const noResultContainer = document.getElementById('no-result-container');
    const downloadSection = document.querySelector('.download-section');
    const featuresSection = document.querySelector('.features-section');
    const howToSection = document.querySelector('.how-to-section');
    
    if (noResultContainer) {
        noResultContainer.style.display = 'none';
    }
    
    downloadSection.style.display = 'none';
    featuresSection.classList.add('hidden');
    howToSection.classList.add('hidden');
    
    let mediaGridHTML = '<div class="media-grid">';
    
    results.forEach((item, index) => {
        const isVideo = item.type === 'video';
        const thumbnail = isVideo ? item.thumbnail : item.image;
        const downloadUrl = item.url;
        
        mediaGridHTML += `
            <div class="media-item">
                <img src="${thumbnail}" alt="${isVideo ? 'Video' : 'Image'} ${index + 1}" loading="lazy">
                <div class="media-info">
                    <span class="media-type">
                        <i class="fas fa-${isVideo ? 'video' : 'image'}"></i>
                        ${isVideo ? 'Video' : 'Image'}
                    </span>
                    <button class="media-download-btn" onclick="downloadFile('${downloadUrl}')">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            </div>
        `;
    });
    
    mediaGridHTML += '</div>';
    
    mediaGridHTML += `
        <div class="download-another-container">
            <button class="download-another-btn" onclick="clearInput()">
                <i class="fas fa-redo"></i>
                Download Another
            </button>
        </div>
    `;
    
    resultContainer.innerHTML = mediaGridHTML;
    resultContainer.style.display = 'block';
}

function showNoResult(message) {
    const resultContainer = document.getElementById('result-container');
    resultContainer.style.display = 'none';
    
    let noResultContainer = document.getElementById('no-result-container');
    
    if (!noResultContainer) {
        noResultContainer = document.createElement('div');
        noResultContainer.id = 'no-result-container';
        noResultContainer.className = 'no-result-container';
        
        const mainContainer = document.querySelector('.container');
        const downloadSection = document.querySelector('.download-section');
        mainContainer.insertBefore(noResultContainer, downloadSection.nextSibling);
    }
    
    noResultContainer.innerHTML = `
        <div class="no-result-content">
            <div class="no-result-icon">
                <i class="fas fa-search"></i>
            </div>
            <h3>No Result Found</h3>
            <p>${message}</p>
            <button class="try-again-btn" onclick="clearInput()">
                <i class="fas fa-redo"></i>
                Try Again
            </button>
        </div>
    `;
    
    noResultContainer.style.display = 'block';
}

function downloadFile(downloadUrl) {
    window.location.href = downloadUrl;
}

function showError(message) {
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    
    errorText.textContent = message;
    errorMessage.classList.add('active');
}

function handleScroll() {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('year').textContent = new Date().getFullYear();
    
    const downloadBtn = document.getElementById('download-btn');
    const input = document.getElementById('instagram-url');
    const pasteBtn = document.getElementById('paste-btn');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navMenu = document.getElementById('nav-menu');
    
    downloadBtn.addEventListener('click', handleDownload);
    pasteBtn.addEventListener('click', handleIconClick);
    
    input.addEventListener('input', updateInputIcon);
    
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleDownload();
        }
    });
    
    hamburgerMenu.addEventListener('click', function() {
        navMenu.classList.toggle('show');
    });
    
    document.addEventListener('click', function(event) {
        if (!hamburgerMenu.contains(event.target) && !navMenu.contains(event.target)) {
            navMenu.classList.remove('show');
        }
    });
    
    window.addEventListener('scroll', handleScroll);
    
    observeElements();
});
