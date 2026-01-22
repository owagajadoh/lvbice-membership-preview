// LVBICE Membership Application - Updated with Individual Flow Modals
// FIXED: Removed extra modal, updated button text, fixed currency display
document.addEventListener('DOMContentLoaded', function() {
    const app = new LvbiceMembership();
    app.init();
});

class LvbiceMembership {
    constructor() {
        this.userData = null;
        this.orgData = null;
        this.selectedOrgType = null;
        this.countryData = this.getCountryData();
        this.elements = {};
        this.selectedCountry = 'KE'; // Default to Kenya
        
        // M-Pesa details
        this.mpesaDetails = {
            paybill: '303030',
            account: 'CEGZ#LVBICE'
        };
        
        // Selected tier information
        this.selectedTier = null;
        this.selectedTierAmount = 0;
        this.selectedTierLabel = '';
        
        // Silver selection
        this.silverSelection = null;
        
        // Exchange rate for USD to KSH
        this.EXCHANGE_RATE = 130; // 1 USD = 130 KSH
        
        // Notification system
        this.notificationTimeout = null;
        
        // Session timeout
        this.sessionTimeout = null;
        this.timeoutWarning = null;
        
        // Silent limitation constants
        this.MAX_DONATION = 500000; // M-Pesa limit
        this.MAX_PHONE_DIGITS = 13; // Max digits for international numbers
    }
    
    init() {
        console.log('=== DEBUG: Initializing LVBICE app ===');
        
        // DEBUG: Check for Become Member button BEFORE anything else
        this.debugButtonCheck();
        
        this.cacheElements();
        this.bindEvents();
        this.populateCountries();
        this.setupMpesaHandling();
        this.setupTierHandling();
        this.setupIndividualFormValidation();
        this.setupNotificationSystem();
        this.setupCopyButtons();
        this.setupKeyboardNavigation();
        this.setupSessionTimeout();
        this.setupAutoSave();
        console.log('LVBICE Membership App initialized with all enhancements');
        
    }
    
    debugButtonCheck() {
        console.log('=== DEBUG: Checking Become Member Button ===');
        
        // Check if button exists
        const button = document.getElementById('becomeMemberBtn');
        console.log('1. Button element found:', button);
        
        if (button) {
            console.log('2. Button innerHTML:', button.innerHTML);
            console.log('3. Button class list:', button.className);
            console.log('4. Button computed styles:');
            
            // Check computed styles
            const styles = window.getComputedStyle(button);
            console.log('   - display:', styles.display);
            console.log('   - visibility:', styles.visibility);
            console.log('   - opacity:', styles.opacity);
            console.log('   - pointer-events:', styles.pointerEvents);
            console.log('   - position:', styles.position);
            console.log('   - z-index:', styles.zIndex);
            console.log('   - width:', styles.width);
            console.log('   - height:', styles.height);
            
            // Check if button is visible
            const rect = button.getBoundingClientRect();
            console.log('5. Button bounding rect:', rect);
            console.log('   - visible:', rect.width > 0 && rect.height > 0);
            
            // Apply debug styling (no red border)
            button.style.position = 'relative';
            button.style.zIndex = '99999';
            
            console.log('=== DEBUG COMPLETE ===');
        } else {
            console.error('❌ ERROR: Become Member button NOT FOUND in DOM!');
            console.log('Searching for alternative selectors...');
            
            // Try alternative selectors
            const allButtons = document.querySelectorAll('button');
            console.log('All buttons on page:', allButtons.length);
            allButtons.forEach((btn, i) => {
                if (btn.textContent.includes('Become') || btn.textContent.includes('Member')) {
                    console.log(`Found matching button ${i}:`, btn.id, btn.textContent);
                }
            });
        }
    }
    
    setupFallbackButtonListener() {
        // Fallback event listener for Become Member button
        setTimeout(() => {
            const button = document.getElementById('becomeMemberBtn');
            if (button) {
                console.log('🔄 Setting up fallback event listener...');
                
                // Clone and replace to remove any existing listeners
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                // Add direct event listener
                newButton.addEventListener('click', (e) => {
                    console.log('🎯 FALLBACK: Become Member button clicked!');
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Open modal
                    this.openModal('membership');
                }, true); // Use capture phase to ensure it fires
                
                // Also add onclick as backup
                newButton.onclick = (e) => {
                    console.log('🎯 ONCLICK: Become Member button clicked!');
                    e.preventDefault();
                    
                    this.openModal('membership');
                    return false;
                };
                
                console.log('✅ Fallback event listener added');
            }
        }, 100);
    }
    
    cacheElements() {
        // Main button - FIX: Use getElementById and ensure button exists
        this.elements.becomeMemberBtn = document.getElementById('becomeMemberBtn');
        console.log('Cached becomeMemberBtn:', this.elements.becomeMemberBtn);
        
        // ALL Modals
        this.elements.membershipModal = document.getElementById('membershipModal');
        this.elements.donationModal = document.getElementById('donationModal');
        this.elements.organizationTierModal = document.getElementById('organizationTierModal');
        this.elements.paymentModal = document.getElementById('paymentModal');
        
        // NEW Individual Flow Modals
        this.elements.individualPaymentModal = document.getElementById('individualPaymentModal');
        this.elements.successModal = document.getElementById('successModal');
        
        // ALL Close buttons
        this.elements.closeModal = document.getElementById('closeModal');
        this.elements.closeDonationModal = document.getElementById('closeDonationModal');
        this.elements.closeTierModal = document.getElementById('closeTierModal');
        this.elements.closePaymentModal = document.getElementById('closePaymentModal');
        
        // NEW Close Buttons
        this.elements.closeIndividualPaymentModal = document.getElementById('closeIndividualPaymentModal');
        this.elements.closeSuccessModal = document.getElementById('closeSuccessModal');
        this.elements.closeSuccessBtn = document.getElementById('closeSuccessBtn');
        
        // ALL Screens
        this.elements.selectionScreen = document.getElementById('selectionScreen');
        this.elements.individualForm = document.getElementById('individualForm');
        this.elements.organizationTypeScreen = document.getElementById('organizationTypeScreen');
        this.elements.organizationForm = document.getElementById('organizationForm');
        
        // ALL Selection buttons
        this.elements.individualOption = document.getElementById('individualOption');
        this.elements.organizationOption = document.getElementById('organizationOption');
        
        // ALL Organization type buttons
        this.elements.stateOrganization = document.getElementById('stateOrganization');
        this.elements.nonStateOrganization = document.getElementById('nonStateOrganization');
        
        // ALL Back buttons
        this.elements.backToSelection = document.getElementById('backToSelection');
        this.elements.backToSelectionFromType = document.getElementById('backToSelectionFromType');
        this.elements.backToTypeSelection = document.getElementById('backToTypeSelection');
        this.elements.backToOrgFormFromTier = document.getElementById('backToOrgFormFromTier');
        this.elements.backToTierSelection = document.getElementById('backToTierSelection');
        
        // ALL Forms and inputs - INDIVIDUAL
        this.elements.registrationForm = document.getElementById('registrationForm');
        this.elements.fullName = document.getElementById('fullName');
        this.elements.email = document.getElementById('email');
        this.elements.phone = document.getElementById('phone');
        this.elements.indCountryCode = document.getElementById('indCountryCode');
        this.elements.country = document.getElementById('country');
        this.elements.terms = document.getElementById('terms');
        
        // Donation checkbox for individual (remove old one)
        this.elements.makeDonation = document.getElementById('makeDonation');
        this.elements.donationSection = document.getElementById('donationSection');
        this.elements.individualDonationAmount = document.getElementById('individualDonationAmount');
        
        // NEW Individual Donation Elements
        this.elements.individualDonationAmountModal = document.getElementById('individualDonationAmountModal');
        this.elements.submitIndividualDonation = document.getElementById('submitIndividualDonation');
        this.elements.skipIndividualDonation = document.getElementById('skipIndividualDonation');
        this.elements.registerLater = document.getElementById('registerLater');
        
        // NEW Success Modal Elements
        this.elements.successMessage = document.getElementById('successMessage');
        
        // Individual form submit button (CHANGED from submit to button)
        this.elements.submitIndividualForm = document.getElementById('submitIndividualForm');
        
        // ALL Forms and inputs - ORGANIZATION
        this.elements.organizationRegistrationForm = document.getElementById('organizationRegistrationForm');
        this.elements.orgTypeDescription = document.getElementById('orgTypeDescription');
        this.elements.orgCategory = document.getElementById('orgCategory');
        this.elements.orgName = document.getElementById('orgName');
        this.elements.otherOrgNameGroup = document.getElementById('otherOrgNameGroup');
        this.elements.otherOrgName = document.getElementById('otherOrgName');
        this.elements.contactName = document.getElementById('contactName');
        this.elements.contactTitle = document.getElementById('contactTitle');
        this.elements.contactEmail = document.getElementById('contactEmail');
        this.elements.contactPhone = document.getElementById('contactPhone');
        this.elements.orgCountryCode = document.getElementById('orgCountryCode');
        this.elements.orgCountry = document.getElementById('orgCountry');
        this.elements.orgTerms = document.getElementById('orgTerms');
        
        // ALL Donation elements
        this.elements.donationAmount = document.getElementById('donationAmount');
        this.elements.paymentMethod = document.getElementById('paymentMethod');
        this.elements.submitDonation = document.getElementById('submitDonation');
        this.elements.skipDonation = document.getElementById('skipDonation');
        
        // M-Pesa donation instructions
        this.elements.mpesaDonationInstructions = document.getElementById('mpesaDonationInstructions');
        
        // ALL Tier selection elements
        this.elements.tierButtons = document.querySelectorAll('.select-tier-btn');
        this.elements.silverOptionButtons = document.querySelectorAll('.silver-option-btn');
        this.elements.selectSilverBtn = document.getElementById('selectSilverBtn');
        
        // ALL Payment modal elements
        this.elements.submitPayment = document.getElementById('submitPayment');
        this.elements.confirmPayment = document.getElementById('confirmPayment');
        this.elements.paymentSubtitle = document.getElementById('paymentSubtitle');
        this.elements.selectedTierDisplay = document.getElementById('selectedTierDisplay');
        this.elements.paymentAmountDisplay = document.getElementById('paymentAmountDisplay');
        this.elements.paymentAmountKES = document.getElementById('paymentAmountKES');
        
        // M-Pesa elements
        this.elements.paybillNumber = document.getElementById('paybillNumber');
        this.elements.accountNumber = document.getElementById('accountNumber');
        
        // ALL Error elements
        this.cacheErrorElements();
        
        // Notification system
        this.elements.notification = document.getElementById('notification');
        this.elements.notificationTitle = document.querySelector('.notification-title');
        this.elements.notificationMessage = document.querySelector('.notification-message');
        this.elements.notificationClose = document.querySelector('.notification-close');
        
        // Loading overlay (will be created dynamically)
        this.elements.loadingOverlay = null;
    }
    
    cacheErrorElements() {
        // Cache ALL error message elements
        this.elements.errorMessages = {
            // Individual form errors
            fullNameError: document.getElementById('fullNameError'),
            emailError: document.getElementById('emailError'),
            countryError: document.getElementById('countryError'),
            phoneError: document.getElementById('phoneError'),
            termsError: document.getElementById('termsError'),
            
            // Organization form errors
            orgNameError: document.getElementById('orgNameError'),
            orgCategoryError: document.getElementById('orgCategoryError'),
            otherOrgNameError: document.getElementById('otherOrgNameError'),
            contactNameError: document.getElementById('contactNameError'),
            contactTitleError: document.getElementById('contactTitleError'),
            contactEmailError: document.getElementById('contactEmailError'),
            orgCountryError: document.getElementById('orgCountryError'),
            contactPhoneError: document.getElementById('contactPhoneError'),
            orgTermsError: document.getElementById('orgTermsError'),
            
            // Donation form errors
            donationAmountError: document.getElementById('donationAmountError'),
            paymentMethodError: document.getElementById('paymentMethodError')
        };
        
        // Cache ALL checkbox containers
        this.elements.termsContainer = document.getElementById('termsContainer');
        this.elements.orgTermsContainer = document.getElementById('orgTermsContainer');
    }
    
    bindEvents() {
        console.log('=== Binding events ===');
        
        // Open main modal - FIXED: Enhanced with multiple fallbacks
        if (this.elements.becomeMemberBtn) {
            console.log('✅ Button found, adding primary event listener...');
            
            // Remove any existing event listeners by cloning
            const originalBtn = this.elements.becomeMemberBtn;
            const newBtn = originalBtn.cloneNode(true);
            originalBtn.parentNode.replaceChild(newBtn, originalBtn);
            this.elements.becomeMemberBtn = newBtn;
            
            // Add event listener with CAPTURE phase
            newBtn.addEventListener('click', (e) => {
                console.log('🎯 PRIMARY: Become Member button clicked!', e);
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                this.openModal('membership');
                this.focusFirstInput('membershipModal');
                
                return false;
            }, true); // Use capture: true to ensure it fires first
            
            // Also add as onclick attribute as backup
            newBtn.setAttribute('onclick', 'return false;');
            newBtn.onclick = (e) => {
                console.log('🎯 ONCLICK ATTRIBUTE: Become Member button clicked!');
                e.preventDefault();
                
                this.openModal('membership');
                return false;
            };
            
            // Add mousedown/up for debugging
            newBtn.addEventListener('mousedown', () => {
                console.log('Mouse DOWN on becomeMemberBtn');
            });
            
            newBtn.addEventListener('mouseup', () => {
                console.log('Mouse UP on becomeMemberBtn');
            });
            
            console.log('✅ Primary event listener added to becomeMemberBtn');
        } else {
            console.error('❌ ERROR: becomeMemberBtn element not found during bindEvents!');
        }
        
        // Close ALL modals
        this.bindEvent(this.elements.closeModal, 'click', () => this.closeModal('membership'));
        this.bindEvent(this.elements.closeDonationModal, 'click', () => this.closeModal('donation'));
        this.bindEvent(this.elements.closeTierModal, 'click', () => this.closeModal('tier'));
        this.bindEvent(this.elements.closePaymentModal, 'click', () => this.closeModal('payment'));
        this.bindEvent(this.elements.closeIndividualPaymentModal, 'click', () => this.closeModal('individualPayment'));
        this.bindEvent(this.elements.closeSuccessModal, 'click', () => this.closeModal('success'));
        this.bindEvent(this.elements.closeSuccessBtn, 'click', () => this.closeModal('success'));
        
        // Close ALL modals when clicking outside
        this.bindEvent(this.elements.membershipModal, 'click', (e) => {
            if (e.target === this.elements.membershipModal) this.closeModal('membership');
        });
        
        this.bindEvent(this.elements.donationModal, 'click', (e) => {
            if (e.target === this.elements.donationModal) this.closeModal('donation');
        });
        
        this.bindEvent(this.elements.organizationTierModal, 'click', (e) => {
            if (e.target === this.elements.organizationTierModal) this.closeModal('tier');
        });
        
        this.bindEvent(this.elements.paymentModal, 'click', (e) => {
            if (e.target === this.elements.paymentModal) this.closeModal('payment');
        });
        
        this.bindEvent(this.elements.individualPaymentModal, 'click', (e) => {
            if (e.target === this.elements.individualPaymentModal) this.closeModal('individualPayment');
        });
        
        this.bindEvent(this.elements.successModal, 'click', (e) => {
            if (e.target === this.elements.successModal) this.closeModal('success');
        });
        
        // Selection options
        this.bindEvent(this.elements.individualOption, 'click', () => {
            this.showScreen('individualForm');
            this.setupIndividualFormValidation();
            this.focusFirstInput('individualForm');
        });
        
        this.bindEvent(this.elements.organizationOption, 'click', () => {
            this.selectedOrgType = null;
            this.showScreen('organizationTypeScreen');
            this.focusFirstInput('organizationTypeScreen');
        });
        
        // Organization type selection
        this.bindEvent(this.elements.stateOrganization, 'click', () => this.selectOrganizationType('state'));
        this.bindEvent(this.elements.nonStateOrganization, 'click', () => this.selectOrganizationType('non-state'));
        
        // ALL Back buttons
        this.bindEvent(this.elements.backToSelection, 'click', () => this.showScreen('selectionScreen'));
        this.bindEvent(this.elements.backToSelectionFromType, 'click', () => this.showScreen('selectionScreen'));
        this.bindEvent(this.elements.backToTypeSelection, 'click', () => this.showScreen('organizationTypeScreen'));
        this.bindEvent(this.elements.backToOrgFormFromTier, 'click', () => {
            this.closeModal('tier');
            this.openModal('membership');
            this.showScreen('organizationForm');
        });
        this.bindEvent(this.elements.backToTierSelection, 'click', () => {
            this.closeModal('payment');
            this.openModal('tier');
        });
        
        // Individual form submission - NEW FLOW
        this.bindEvent(this.elements.submitIndividualForm, 'click', (e) => {
            e.preventDefault();
            if (this.validateForm('registrationForm')) {
                this.handleIndividualRegistration();
            }
        });
        
        // NEW Individual donation flow buttons
        this.bindEvent(this.elements.submitIndividualDonation, 'click', (e) => {
            e.preventDefault();
            this.handleIndividualDonation();
        });
        
        this.bindEvent(this.elements.skipIndividualDonation, 'click', (e) => {
            e.preventDefault();
            this.skipIndividualDonation();
        });
        
        this.bindEvent(this.elements.registerLater, 'click', (e) => {
            e.preventDefault();
            this.registerLater();
        });
        
        // Organization form submission
        this.bindEvent(this.elements.organizationRegistrationForm, 'submit', async (e) => {
            e.preventDefault();
            if (this.validateForm('organizationRegistrationForm')) {
                await this.handleOrganizationRegistration(e);
            }
        });
        
        // Donation checkbox toggle for individual (remove old one)
        if (this.elements.makeDonation) {
            this.elements.makeDonation.addEventListener('change', (e) => {
                const showDonation = e.target.checked;
                this.elements.donationSection.style.display = showDonation ? 'block' : 'none';
                this.elements.individualDonationAmount.required = showDonation;
            });
        }
        
        // Donation submission (old modal)
        this.bindEvent(this.elements.submitDonation, 'click', async (e) => {
            e.preventDefault();
            if (this.validateDonationForm()) {
                await this.handleDonation();
            }
        });
        
        // Add silent donation limit to donation amount inputs
        if (this.elements.donationAmount) {
            this.elements.donationAmount.addEventListener('input', (e) => {
                this.silentDonationLimit(e);
            });
        }

        if (this.elements.individualDonationAmountModal) {
            this.elements.individualDonationAmountModal.addEventListener('input', (e) => {
                this.silentDonationLimit(e);
            });
        }
        
        // Payment method change for M-Pesa instructions
        this.bindEvent(this.elements.paymentMethod, 'change', (e) => {
            const showMpesa = e.target.value === 'mpesa';
            this.elements.mpesaDonationInstructions.style.display = showMpesa ? 'block' : 'none';
        });
        
        // Skip donation link
        this.bindEvent(this.elements.skipDonation, 'click', () => this.completeRegistration());
        
        // FIXED: Payment submission - REMOVED EXTRA MODAL POPUP
        this.bindEvent(this.elements.submitPayment, 'click', (e) => {
            e.preventDefault();
            // DIRECTLY process payment without extra modal
            this.completePayment(this.selectedTierAmount);
        });
        
        this.bindEvent(this.elements.confirmPayment, 'click', async (e) => {
            e.preventDefault();
            await this.completeOrganizationRegistration();
        });
        
        // Clear errors on input
        this.addInputValidationListeners();
        
        // Organization category change
        this.bindEvent(this.elements.orgCategory, 'change', () => this.handleOrgCategoryChange());
        
        // Country change for phone code (Individual)
        this.bindEvent(this.elements.country, 'change', () => this.updateIndividualPhoneCode());
        
        // Country change for phone code (Organization)
        this.bindEvent(this.elements.orgCountry, 'change', () => this.updateOrganizationPhoneCode());
        
        // Phone number input restrictions
        this.bindEvent(this.elements.phone, 'input', (e) => {
            this.restrictPhoneInput(e, 'individual');
            this.preventCountryCodeInPhone(e, 'individual');
            this.formatPhoneNumber(e, 'individual');
            this.silentPhoneLimitGeneral(e);
        });
        
        this.bindEvent(this.elements.contactPhone, 'input', (e) => {
            this.restrictPhoneInput(e, 'organization');
            this.preventCountryCodeInPhone(e, 'organization');
            this.formatPhoneNumber(e, 'organization');
            this.silentPhoneLimitGeneral(e);
        });
        
        // Name input restrictions
        this.bindEvent(this.elements.fullName, 'input', (e) => this.restrictNameInput(e));
        this.bindEvent(this.elements.contactName, 'input', (e) => this.restrictNameInput(e));
        
        // Email validation
        this.bindEvent(this.elements.email, 'input', (e) => this.validateEmailInput(e));
        this.bindEvent(this.elements.contactEmail, 'input', (e) => this.validateEmailInput(e));
        
        // Organization name restriction
        this.bindEvent(this.elements.orgName, 'input', (e) => this.restrictOrgNameInput(e));
        this.bindEvent(this.elements.contactTitle, 'input', (e) => this.restrictTitleInput(e));
        
        // Escape key to close ALL modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.elements.membershipModal?.style.display === 'flex') this.closeModal('membership');
                if (this.elements.donationModal?.style.display === 'flex') this.closeModal('donation');
                if (this.elements.organizationTierModal?.style.display === 'flex') this.closeModal('tier');
                if (this.elements.paymentModal?.style.display === 'flex') this.closeModal('payment');
                if (this.elements.individualPaymentModal?.style.display === 'flex') this.closeModal('individualPayment');
                if (this.elements.successModal?.style.display === 'flex') this.closeModal('success');
            }
        });
    }
    
    // Helper function to safely bind events
    bindEvent(element, event, handler) {
        if (element) {
            element.addEventListener(event, handler);
        }
    }
    
    // ====================
    // NEW METHOD: HIDE BECOME MEMBER BUTTON
    // ====================
    
    hideBecomeMemberButton() {
        console.log('Hiding become member button (while modal is open)');
        const button = this.elements.becomeMemberBtn;
        if (button) {
            // Use opacity and pointer-events instead of display:none
            // So it stays in the layout but is invisible
            button.style.opacity = '0';
            button.style.visibility = 'hidden';
            button.style.pointerEvents = 'none';
            button.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';
            
            console.log('✅ Become Member button hidden (opacity: 0)');
        }
    }
    
    showBecomeMemberButton() {
        console.log('Showing become member button (modal closed)');
        const button = this.elements.becomeMemberBtn;
        if (button) {
            // Restore visibility
            button.style.opacity = '1';
            button.style.visibility = 'visible';
            button.style.pointerEvents = 'auto';
            
            console.log('✅ Become Member button shown (opacity: 1)');
        }
    }
    
    // ====================
    // ENHANCEMENT METHODS
    // ====================
    
    // Setup Notification System
    setupNotificationSystem() {
        // Close notification when close button is clicked
        this.elements.notificationClose?.addEventListener('click', () => {
            this.hideNotification();
        });
        
        // Auto-hide notification after 5 seconds if not already hidden
        this.elements.notification?.addEventListener('mouseenter', () => {
            clearTimeout(this.notificationTimeout);
        });
        
        this.elements.notification?.addEventListener('mouseleave', () => {
            if (this.elements.notification.classList.contains('show')) {
                this.notificationTimeout = setTimeout(() => {
                    this.hideNotification();
                }, 5000);
            }
        });
    }
    
    showNotification(title, message, type = 'success') {
        if (this.elements.notificationTitle && this.elements.notificationMessage) {
            this.elements.notificationTitle.textContent = title;
            this.elements.notificationMessage.textContent = message;
            
            // Set notification type (for different styles)
            this.elements.notification.className = 'notification show';
            this.elements.notification.classList.add(type);
            
            // Auto-hide after 5 seconds
            clearTimeout(this.notificationTimeout);
            this.notificationTimeout = setTimeout(() => {
                this.hideNotification();
            }, 5000);
        }
    }
    
    hideNotification() {
        if (this.elements.notification) {
            this.elements.notification.classList.remove('show');
            clearTimeout(this.notificationTimeout);
        }
    }
    
    // Setup Tier handling
    setupTierHandling() {
        // Tier selection buttons
        this.elements.tierButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tier = e.target.getAttribute('data-tier');
                const amount = parseInt(e.target.getAttribute('data-amount'));
                this.selectTier(tier, amount);
            });
        });
        
        // Silver tier option buttons
        this.elements.silverOptionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Remove active class from all silver buttons
                this.elements.silverOptionButtons.forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Add active class to clicked button
                e.target.classList.add('active');
                
                // Update silver button
                const amount = parseInt(e.target.getAttribute('data-amount'));
                const label = e.target.getAttribute('data-label');
                this.elements.selectSilverBtn.style.display = 'block';
                this.elements.selectSilverBtn.textContent = `SELECT SILVER TIER - ${label}`;
                this.elements.selectSilverBtn.setAttribute('data-amount', amount);
                
                // Store silver selection
                this.silverSelection = {
                    amount: amount,
                    label: label
                };
            });
        });
    }
    
    // Setup M-Pesa handling
    setupMpesaHandling() {
        // Set M-Pesa details in the HTML
        const paybillElements = document.querySelectorAll('#paybillNumber, [data-copy="303030"]');
        const accountElements = document.querySelectorAll('#accountNumber, [data-copy="CEGZ#LVBICE"]');
        
        paybillElements.forEach(el => {
            if (el.id) el.textContent = this.mpesaDetails.paybill;
        });
        
        accountElements.forEach(el => {
            if (el.id) el.textContent = this.mpesaDetails.account;
        });
    }
    
    // Setup copy buttons for all copy buttons
    setupCopyButtons() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('copy-btn') || e.target.closest('.copy-btn')) {
                const button = e.target.classList.contains('copy-btn') ? e.target : e.target.closest('.copy-btn');
                const text = button.getAttribute('data-copy') || 
                            button.parentElement.querySelector('.detail-value')?.textContent ||
                            button.parentElement.parentElement.querySelector('.detail-value')?.textContent;
                
                if (text) {
                    this.copyToClipboard(text);
                    this.showNotification('Copied!', 'Text copied to clipboard', 'info');
                }
            }
        });
    }
    
    // Setup keyboard navigation for accessibility
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Tab key navigation within modals
            if (e.key === 'Tab') {
                const activeModals = [
                    this.elements.membershipModal,
                    this.elements.donationModal,
                    this.elements.organizationTierModal,
                    this.elements.paymentModal,
                    this.elements.individualPaymentModal,
                    this.elements.successModal
                ].filter(modal => modal && modal.style.display === 'flex');
                
                if (activeModals.length > 0) {
                    const modal = activeModals[0];
                    const focusableElements = modal.querySelectorAll(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );
                    
                    if (focusableElements.length > 0) {
                        const firstElement = focusableElements[0];
                        const lastElement = focusableElements[focusableElements.length - 1];
                        
                        if (e.shiftKey && document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        } else if (!e.shiftKey && document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
            }
        });
    }
    
    // Setup session timeout warning
    setupSessionTimeout() {
        const timeoutDuration = 15 * 60 * 1000; // 15 minutes
        const warningDuration = 1 * 60 * 1000; // 1 minute warning
        
        const resetTimeout = () => {
            clearTimeout(this.sessionTimeout);
            clearTimeout(this.timeoutWarning);
            
            this.sessionTimeout = setTimeout(() => {
                this.timeoutWarning = setTimeout(() => {
                    this.showNotification(
                        'Session Expired',
                        'Your session has expired due to inactivity. Please start again.',
                        'warning'
                    );
                    this.resetAllForms();
                }, warningDuration);
                
                this.showNotification(
                    'Session Expiring Soon',
                    'Your session will expire in 1 minute due to inactivity.',
                    'info'
                );
            }, timeoutDuration);
        };
        
        // Reset on user activity
        ['click', 'keypress', 'scroll', 'mousemove', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetTimeout, { passive: true });
        });
        
        resetTimeout();
    }
    
    // Setup auto-save for forms
    setupAutoSave() {
        const forms = ['registrationForm', 'organizationRegistrationForm'];
        
        forms.forEach(formId => {
            const form = document.getElementById(formId);
            if (form) {
                const inputs = form.querySelectorAll('input, select, textarea');
                inputs.forEach(input => {
                    input.addEventListener('input', () => {
                        const formData = this.collectFormData(formId);
                        this.saveDraft(formId, formData);
                    });
                });
                
                // Load draft on page load
                setTimeout(() => {
                    this.loadDraft(formId);
                }, 100);
            }
        });
    }
    
    // ====================
    // SILENT DONATION & PHONE LIMITATION
    // ====================
    
    // Silent donation amount limitation (no messages shown)
    silentDonationLimit(e) {
        const input = e.target;
        let value = input.value.replace(/[^\d]/g, '');
        
        // If value exceeds 500,000, silently cut it at 500,000
        if (parseInt(value) > this.MAX_DONATION) {
            value = this.MAX_DONATION.toString();
        }
        
        // Also prevent more than 6 digits (500000 has 6 digits)
        if (value.length > 6) {
            value = value.slice(0, 6);
        }
        
        input.value = value;
    }
    
    // Silent phone limitation (no messages shown)
    silentPhoneLimitGeneral(e) {
        const input = e.target;
        let value = input.value.replace(/[^\d]/g, '');
        
        // Limit to 13 digits max (for international numbers)
        if (value.length > this.MAX_PHONE_DIGITS) {
            value = value.slice(0, this.MAX_PHONE_DIGITS);
        }
        
        input.value = value;
    }
    
    // ====================
    // CORE FUNCTIONALITY
    // ====================
    
    // Copy to clipboard function
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            // Success feedback handled by notification
        }).catch(err => {
            console.error('Failed to copy: ', err);
            this.showNotification('Error', 'Failed to copy text', 'error');
        });
    }
    
    // Convert USD to KSH
    convertToKsh(usdAmount) {
        return Math.round(usdAmount * this.EXCHANGE_RATE);
    }
    
    // Format currency with both USD and KSH
    formatCurrencyWithBoth(usdAmount) {
        const kshAmount = this.convertToKsh(usdAmount);
        return {
            usd: `USD ${usdAmount.toLocaleString()}`,
            ksh: `KSH ${kshAmount.toLocaleString()}`
        };
    }
    
    // Select tier and proceed to payment if needed
    selectTier(tier, amount) {
        this.selectedTier = tier;
        this.selectedTierAmount = amount;
        
        // Set tier label
        if (tier === 'bronze') {
            this.selectedTierLabel = 'Bronze (Free)';
        } else if (tier === 'silver') {
            const silverLabel = this.silverSelection ? this.silverSelection.label : 'Small (KSH 15,000)';
            this.selectedTierLabel = `Silver - ${silverLabel}`;
            this.selectedTierAmount = this.silverSelection ? this.silverSelection.amount : 15000;
        } else if (tier === 'gold') {
            this.selectedTierLabel = 'Gold (KSH 150,000)';
        }
        
        // Update organization data with tier selection
        if (this.orgData) {
            this.orgData.tier = tier;
            this.orgData.tierLabel = this.selectedTierLabel;
            this.orgData.tierAmount = this.selectedTierAmount;
        }
        
        // If bronze (free), complete registration immediately
        if (tier === 'bronze') {
            this.completeOrganizationRegistration();
            return;
        }
        
        // For paid tiers, show payment modal
        this.showPaymentModal();
    }
    
    // Show payment modal with tier details
    showPaymentModal() {
        this.closeModal('tier');
        
        // Get currency display
        const currencies = this.formatCurrencyWithBoth(this.selectedTierAmount);
        
        // Update payment modal with tier information
        this.elements.paymentSubtitle.textContent = `Complete payment for ${this.selectedTierLabel} membership`;
        this.elements.selectedTierDisplay.textContent = this.selectedTierLabel;
        
        // FIXED: Show both USD and KSH amounts
        if (this.elements.paymentAmountDisplay) {
            this.elements.paymentAmountDisplay.textContent = currencies.usd;
        }
        if (this.elements.paymentAmountKES) {
            this.elements.paymentAmountKES.textContent = currencies.ksh;
        }
        
        // Also update any other amount displays
        const amountDisplays = document.querySelectorAll('#selectedAmountUSD, .usd-amount');
        amountDisplays.forEach(display => {
            if (display.id === 'selectedAmountUSD' || display.classList.contains('usd-amount')) {
                display.textContent = currencies.usd;
            }
        });
        
        const kshDisplays = document.querySelectorAll('#selectedAmountKSH, .ksh-amount');
        kshDisplays.forEach(display => {
            if (display.id === 'selectedAmountKSH' || display.classList.contains('ksh-amount')) {
                display.textContent = currencies.ksh;
            }
        });
        
        // Show payment modal
        setTimeout(() => {
            this.openModal('payment');
            this.focusFirstInput('paymentModal');
        }, 300);
    }
    
    // FORM VALIDATION FUNCTIONS
    validateForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return false;
        
        const inputs = form.querySelectorAll('input[required], select[required]');
        let firstError = null;
        let isValid = true;
        
        // Clear previous errors
        form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        form.querySelectorAll('.error-message').forEach(el => el.classList.remove('show'));
        form.querySelectorAll('.checkbox-container').forEach(el => el.classList.remove('error'));
        
        // Validate each required field
        for (const input of inputs) {
            const errorId = input.id + 'Error';
            const errorElement = document.getElementById(errorId);
            let fieldValid = true;
            
            // Skip hidden fields
            if (input.offsetParent === null) continue;
            
            // Check checkbox differently
            if (input.type === 'checkbox') {
                fieldValid = input.checked;
                if (!fieldValid) {
                    const containerId = input.id + 'Container';
                    const container = document.getElementById(containerId);
                    if (container) container.classList.add('error');
                }
            } 
            // Check select
            else if (input.tagName === 'SELECT') {
                fieldValid = input.value !== '';
            }
            // Check text/email/tel inputs
            else {
                const value = input.value.trim();
                fieldValid = value !== '' && input.checkValidity();
                
                // Additional validation for specific fields
                if (fieldValid && input.type === 'email') {
                    fieldValid = this.validateEmail(value);
                }
                
                if (fieldValid && input.type === 'tel') {
                    const countryCode = formId === 'registrationForm' ? 
                        this.elements.country.value : this.elements.orgCountry.value;
                    fieldValid = this.validatePhoneNumber(value, countryCode);
                }
            }
            
            // Show error if invalid
            if (!fieldValid) {
                input.classList.add('error');
                if (errorElement) {
                    errorElement.classList.add('show');
                }
                
                isValid = false;
                
                // Focus on first error field
                if (!firstError) {
                    firstError = input;
                }
            }
        }
        
        // Focus on first error field
        if (firstError) {
            firstError.focus();
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        return isValid;
    }
    
    validateDonationForm() {
        let isValid = true;
        let firstError = null;
        
        // Clear previous errors
        document.querySelectorAll('#donationModal .error').forEach(el => el.classList.remove('error'));
        document.querySelectorAll('#donationModal .error-message').forEach(el => el.classList.remove('show'));
        
        // Validate donation amount
        const amount = this.elements.donationAmount;
        if (!amount.value || amount.value < 1) {
            amount.classList.add('error');
            this.elements.errorMessages.donationAmountError.classList.add('show');
            isValid = false;
            firstError = amount;
        }
        
        // Validate payment method
        const method = this.elements.paymentMethod;
        if (!method.value) {
            method.classList.add('error');
            this.elements.errorMessages.paymentMethodError.classList.add('show');
            isValid = false;
            if (!firstError) firstError = method;
        }
        
        // Focus on first error
        if (firstError) {
            firstError.focus();
        }
        
        return isValid;
    }
    
    addInputValidationListeners() {
        // Individual form input listeners
        const individualInputs = this.elements.registrationForm?.querySelectorAll('input, select') || [];
        individualInputs.forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('error');
                const errorId = input.id + 'Error';
                const errorElement = document.getElementById(errorId);
                if (errorElement) errorElement.classList.remove('show');
                
                if (input.type === 'checkbox') {
                    const containerId = input.id + 'Container';
                    const container = document.getElementById(containerId);
                    if (container) container.classList.remove('error');
                }
            });
        });
        
        // Organization form input listeners
        const organizationInputs = this.elements.organizationRegistrationForm?.querySelectorAll('input, select') || [];
        organizationInputs.forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('error');
                const errorId = input.id + 'Error';
                const errorElement = document.getElementById(errorId);
                if (errorElement) errorElement.classList.remove('show');
                
                if (input.type === 'checkbox') {
                    const containerId = input.id + 'Container';
                    const container = document.getElementById(containerId);
                    if (container) container.classList.remove('error');
                }
            });
        });
        
        // Donation form input listeners (old modal)
        if (this.elements.donationAmount) {
            this.elements.donationAmount.addEventListener('input', () => {
                this.elements.donationAmount.classList.remove('error');
                this.elements.errorMessages.donationAmountError.classList.remove('show');
            });
        }
        
        if (this.elements.paymentMethod) {
            this.elements.paymentMethod.addEventListener('change', () => {
                this.elements.paymentMethod.classList.remove('error');
                this.elements.errorMessages.paymentMethodError.classList.remove('show');
            });
        }
    }
    
    // COUNTRY DATA
    getCountryData() {
        return [
            { code: 'KE', name: 'Kenya', phoneCode: '+254', digits: 9, currency: 'KES' },
            { code: 'TZ', name: 'Tanzania', phoneCode: '+255', digits: 9, currency: 'TZS' },
            { code: 'UG', name: 'Uganda', phoneCode: '+256', digits: 9, currency: 'UGX' },
            { code: 'RW', name: 'Rwanda', phoneCode: '+250', digits: 9, currency: 'RWF' },
            { code: 'BI', name: 'Burundi', phoneCode: '+257', digits: 8, currency: 'BIF' },
            { code: 'ET', name: 'Ethiopia', phoneCode: '+251', digits: 9, currency: 'ETB' },
            { code: 'SS', name: 'South Sudan', phoneCode: '+211', digits: 9, currency: 'SSP' },
            { code: 'CD', name: 'DR Congo', phoneCode: '+243', digits: 9, currency: 'CDF' },
            { code: 'SO', name: 'Somalia', phoneCode: '+252', digits: 8, currency: 'SOS' },
            { code: 'SD', name: 'Sudan', phoneCode: '+249', digits: 9, currency: 'SDG' },
            { code: 'EG', name: 'Egypt', phoneCode: '+20', digits: 10, currency: 'EGP' },
            { code: 'ZA', name: 'South Africa', phoneCode: '+27', digits: 9, currency: 'ZAR' },
            { code: 'NG', name: 'Nigeria', phoneCode: '+234', digits: 10, currency: 'NGN' },
            { code: 'GH', name: 'Ghana', phoneCode: '+233', digits: 9, currency: 'GHS' },
            { code: 'US', name: 'United States', phoneCode: '+1', digits: 10, currency: 'USD' },
            { code: 'GB', name: 'United Kingdom', phoneCode: '+44', digits: 10, currency: 'GBP' },
            { code: 'FR', name: 'France', phoneCode: '+33', digits: 9, currency: 'EUR' },
            { code: 'DE', name: 'Germany', phoneCode: '+49', digits: 10, currency: 'EUR' },
            { code: 'CN', name: 'China', phoneCode: '+86', digits: 11, currency: 'CNY' },
            { code: 'IN', name: 'India', phoneCode: '+91', digits: 10, currency: 'INR' }
        ];
    }
    
    populateCountries() {
        // Clear existing options
        if (this.elements.country) {
            this.elements.country.innerHTML = '<option value="">Select your country</option>';
        }
        if (this.elements.orgCountry) {
            this.elements.orgCountry.innerHTML = '<option value="">Select country</option>';
        }
        
        // Populate with country data
        this.countryData.forEach(country => {
            // Individual form
            if (this.elements.country) {
                const option1 = document.createElement('option');
                option1.value = country.code;
                option1.textContent = `${country.name} (${country.phoneCode})`;
                this.elements.country.appendChild(option1);
            }
            
            // Organization form
            if (this.elements.orgCountry) {
                const option2 = document.createElement('option');
                option2.value = country.code;
                option2.textContent = `${country.name} (${country.phoneCode})`;
                this.elements.orgCountry.appendChild(option2);
            }
        });
        
        // Set default to Kenya
        if (this.elements.country) {
            this.elements.country.value = 'KE';
        }
        if (this.elements.orgCountry) {
            this.elements.orgCountry.value = 'KE';
        }
        this.updateIndividualPhoneCode();
        this.updateOrganizationPhoneCode();
    }
    
    updateIndividualPhoneCode() {
        if (this.elements.country && this.elements.indCountryCode) {
            const countryCode = this.elements.country.value;
            const country = this.countryData.find(c => c.code === countryCode);
            if (country) {
                this.elements.indCountryCode.textContent = country.phoneCode;
                if (this.elements.phone) {
                    this.elements.phone.pattern = `[0-9]{${country.digits}}`;
                    this.elements.phone.maxLength = country.digits;
                    this.elements.phone.placeholder = `${'X'.repeat(country.digits)}`;
                    this.elements.phone.title = `${country.digits}-digit phone number required`;
                    this.selectedCountry = countryCode;
                }
            }
        }
    }
    
    updateOrganizationPhoneCode() {
        if (this.elements.orgCountry && this.elements.orgCountryCode) {
            const countryCode = this.elements.orgCountry.value;
            const country = this.countryData.find(c => c.code === countryCode);
            if (country) {
                this.elements.orgCountryCode.textContent = country.phoneCode;
                if (this.elements.contactPhone) {
                    this.elements.contactPhone.pattern = `[0-9]{${country.digits}}`;
                    this.elements.contactPhone.maxLength = country.digits;
                    this.elements.contactPhone.placeholder = `${'X'.repeat(country.digits)}`;
                    this.elements.contactPhone.title = `${country.digits}-digit phone number required`;
                }
            }
        }
    }
    
    // ====================
    // INPUT VALIDATION & FORMATTING
    // ====================
    
    restrictPhoneInput(e, formType) {
        // Remove all non-digit characters
        let value = e.target.value.replace(/[^\d]/g, '');
        
        // Get the country for digit limit
        const countryCode = formType === 'individual' ? 
            this.elements.country?.value : this.elements.orgCountry?.value;
        const country = this.countryData.find(c => c.code === countryCode);
        const maxDigits = country ? country.digits : 9;
        
        // Limit to max digits
        if (value.length > maxDigits) {
            value = value.slice(0, maxDigits);
        }
        
        e.target.value = value;
    }
    
    restrictNameInput(e) {
        // Only allow letters, spaces, hyphens, and apostrophes
        let value = e.target.value.replace(/[^A-Za-z\s\-']/g, '');
        
        // Limit to 50 characters
        if (value.length > 50) {
            value = value.slice(0, 50);
        }
        
        e.target.value = value;
    }
    
    restrictOrgNameInput(e) {
        // Allow letters, numbers, spaces, and basic punctuation
        let value = e.target.value.replace(/[^A-Za-z0-9\s\-&.,'()]/g, '');
        
        // Limit to 100 characters
        if (value.length > 100) {
            value = value.slice(0, 100);
        }
        
        e.target.value = value;
    }
    
    restrictTitleInput(e) {
        // Allow letters, numbers, spaces, and basic punctuation
        let value = e.target.value.replace(/[^A-Za-z0-9\s\-&.,'()]/g, '');
        
        // Limit to 50 characters
        if (value.length > 50) {
            value = value.slice(0, 50);
        }
        
        e.target.value = value;
    }
    
    validateEmailInput(e) {
        const email = e.target.value;
        const isValid = this.validateEmail(email);
        
        if (email && !isValid) {
            e.target.classList.add('error');
            const errorId = e.target.id + 'Error';
            const errorElement = document.getElementById(errorId);
            if (errorElement) {
                errorElement.textContent = 'Please enter a valid email address';
                errorElement.classList.add('show');
            }
        } else {
            e.target.classList.remove('error');
            const errorId = e.target.id + 'Error';
            const errorElement = document.getElementById(errorId);
            if (errorElement) errorElement.classList.remove('show');
        }
        
        return isValid;
    }
    
    formatPhoneNumber(e, formType) {
        const input = e.target;
        let value = input.value.replace(/\D/g, '');
        
        if (value.length === 0) return;
        
        const countryCode = formType === 'individual' ? 
            this.elements.country?.value : this.elements.orgCountry?.value;
        
        // Format based on country
        switch(countryCode) {
            case 'US':
                if (value.length > 3 && value.length <= 6) {
                    value = `(${value.slice(0,3)}) ${value.slice(3)}`;
                } else if (value.length > 6) {
                    value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6,10)}`;
                }
                break;
            case 'GB':
                if (value.length > 4) {
                    value = `${value.slice(0,4)} ${value.slice(4)}`;
                }
                break;
            // Add more country-specific formatting as needed
        }
        
        input.value = value;
    }
    
    setupIndividualFormValidation() {
        // Initialize all fields with current validation
        if (this.elements.fullName) {
            this.restrictNameInput({ target: this.elements.fullName });
        }
        if (this.elements.email) {
            this.validateEmailInput({ target: this.elements.email });
        }
        if (this.elements.phone) {
            this.restrictPhoneInput({ target: this.elements.phone }, 'individual');
        }
    }
    
    // ====================
    // SCREEN & MODAL MANAGEMENT
    // ====================
    
    openModal(modalType) {
        console.log(`Opening modal: ${modalType}`);
        
        // First, close any open modals
        const allModals = [
            this.elements.membershipModal,
            this.elements.donationModal,
            this.elements.organizationTierModal,
            this.elements.paymentModal,
            this.elements.individualPaymentModal,
            this.elements.successModal
        ];
        
        allModals.forEach(modal => {
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
            }
        });
        
        // HIDE THE BUTTON WHEN MODAL OPENS
        this.hideBecomeMemberButton();
        
        let modal;
        switch(modalType) {
            case 'membership':
                modal = this.elements.membershipModal;
                this.showScreen('selectionScreen');
                break;
            case 'donation':
                modal = this.elements.donationModal;
                break;
            case 'tier':
                modal = this.elements.organizationTierModal;
                break;
            case 'payment':
                modal = this.elements.paymentModal;
                break;
            case 'individualPayment':
                modal = this.elements.individualPaymentModal;
                break;
            case 'success':
                modal = this.elements.successModal;
                break;
        }
        
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            console.log(`✅ Modal ${modalType} opened successfully`);
        } else {
            console.error(`❌ Modal ${modalType} not found`);
        }
    }
    
    closeModal(modalType) {
        console.log(`Closing modal: ${modalType}`);
        
        let modal;
        switch(modalType) {
            case 'membership':
                modal = this.elements.membershipModal;
                break;
            case 'donation':
                modal = this.elements.donationModal;
                break;
            case 'tier':
                modal = this.elements.organizationTierModal;
                break;
            case 'payment':
                modal = this.elements.paymentModal;
                break;
            case 'individualPayment':
                modal = this.elements.individualPaymentModal;
                break;
            case 'success':
                modal = this.elements.successModal;
                break;
        }
        
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
            
            // SHOW THE BUTTON AGAIN WHEN MODAL CLOSES
            this.showBecomeMemberButton();
            
            // Only reset overflow if no other modals are open
            if (!this.isAnyModalOpen()) {
                document.body.style.overflow = 'auto';
            }
            
            console.log(`✅ Modal ${modalType} closed successfully`);
        }
    }
    
    isAnyModalOpen() {
        const allModals = [
            this.elements.membershipModal,
            this.elements.donationModal,
            this.elements.organizationTierModal,
            this.elements.paymentModal,
            this.elements.individualPaymentModal,
            this.elements.successModal
        ];
        
        return allModals.some(modal => modal && modal.style.display === 'flex');
    }
    
    showScreen(screenId) {
        const screens = ['selectionScreen', 'individualForm', 'organizationTypeScreen', 'organizationForm'];
        screens.forEach(id => {
            const screen = document.getElementById(id);
            if (screen) screen.classList.remove('active');
        });
        
        const screen = document.getElementById(screenId);
        if (screen) screen.classList.add('active');
    }
    
    // ====================
    // ORGANIZATION TYPE SELECTION
    // ====================
    
    selectOrganizationType(type) {
        this.selectedOrgType = type;
        
        const descriptions = {
            'state': 'State organizations include government agencies, public institutions, and government bodies.',
            'non-state': 'Non-state organizations include PBOs, NGOs, private companies, manufacturers, and civil society organizations.'
        };
        
        if (this.elements.orgTypeDescription) {
            this.elements.orgTypeDescription.textContent = descriptions[type] || '';
        }
        this.populateOrganizationCategories(type);
        this.showScreen('organizationForm');
        this.focusFirstInput('organizationForm');
    }
    
    populateOrganizationCategories(type) {
        if (!this.elements.orgCategory) return;
        
        this.elements.orgCategory.innerHTML = '<option value="">Select category</option>';
        this.elements.otherOrgNameGroup.style.display = 'none';
        this.elements.otherOrgName.required = false;
        
        const categories = {
            'state': [
                { value: 'government_ministry', label: 'Government Ministry' },
                { value: 'county_government', label: 'County Government' },
                { value: 'public_university', label: 'Public University' },
                { value: 'research_institution', label: 'Research Institution' },
                { value: 'regulatory_body', label: 'Regulatory Body' },
                { value: 'parastatal', label: 'Parastatal' },
                { value: 'public_hospital', label: 'Public Hospital' },
                { value: 'other_state', label: 'Other State Agency' },
                { value: 'national_gov', label: 'National Government Agency' },
                { value: 'local_gov', label: 'Local Government Agency' },
                { value: 'public_institution', label: 'Public Institution' },
                { value: 'government_department', label: 'Government Department' },
                { value: 'state_corporation', label: 'State Corporation' }
            ],
            'non-state': [
                { value: 'ngo', label: 'Non-Governmental Organization (NGO)' },
                { value: 'cbo', label: 'Community-Based Organization (CBO)' },
                { value: 'fbo', label: 'Faith-Based Organization (FBO)' },
                { value: 'private_company', label: 'Private Company' },
                { value: 'manufacturer', label: 'Manufacturer' },
                { value: 'consultancy', label: 'Consultancy Firm' },
                { value: 'development_partner', label: 'Development Partner' },
                { value: 'international_ngo', label: 'International NGO' },
                { value: 'pbo', label: 'Public Benefit Organization (PBO)' },
                { value: 'educational', label: 'Educational Institution' },
                { value: 'research_institute', label: 'Research Institute' },
                { value: 'community_organization', label: 'Community Organization' },
                { value: 'professional_association', label: 'Professional Association' },
                { value: 'faith_based', label: 'Faith-based Organization' },
                { value: 'cooperative', label: 'Cooperative Society' },
                { value: 'foundation', label: 'Foundation/Trust' },
                { value: 'student_group', label: 'Student Organization' },
                { value: 'other', label: 'Other' }
            ]
        };
        
        const orgCategories = categories[type] || [];
        orgCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.value;
            option.textContent = category.label;
            this.elements.orgCategory.appendChild(option);
        });
        
        // Add "Other" option if not already present
        if (!orgCategories.find(c => c.value === 'other')) {
            const otherOption = document.createElement('option');
            otherOption.value = 'other';
            otherOption.textContent = 'Other (Specify below)';
            this.elements.orgCategory.appendChild(otherOption);
        }
    }
    
    handleOrgCategoryChange() {
        if (!this.elements.orgCategory || !this.elements.otherOrgNameGroup) return;
        
        const isOther = this.elements.orgCategory.value === 'other';
        this.elements.otherOrgNameGroup.style.display = isOther ? 'block' : 'none';
        this.elements.otherOrgName.required = isOther;
        
        if (!isOther) {
            this.elements.otherOrgName.value = '';
        }
    }
    
    // ====================
    // NEW INDIVIDUAL FLOW HANDLERS
    // ====================
    
    async handleIndividualRegistration() {
        // Get country info for phone validation
        const country = this.countryData.find(c => c.code === this.elements.country.value);
        
        this.userData = {
            fullName: this.elements.fullName.value.trim(),
            email: this.elements.email.value.trim(),
            phone: this.elements.phone.value,
            countryCode: this.elements.indCountryCode.textContent,
            fullPhone: this.elements.indCountryCode.textContent + this.elements.phone.value,
            country: this.elements.country.value,
            agreedToTerms: this.elements.terms.checked,
            timestamp: new Date().toISOString()
        };
        
        console.log('Individual registration data collected:', this.userData);
        
        try {
            // Show loading
            this.showLoading();
            
            // Submit to backend
            await this.submitFormData('individual', this.userData);
            
            // Close membership modal and show individual payment modal
            this.closeModal('membership');
            setTimeout(() => {
                this.openModal('individualPayment');
                this.focusFirstInput('individualPaymentModal');
            }, 300);
            
        } catch (error) {
            console.error('Registration failed:', error);
            this.showNotification('Error', 'Registration failed. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    async handleIndividualDonation() {
        const donationAmount = this.elements.individualDonationAmountModal.value;
        
        if (!donationAmount || donationAmount < 100) {
            this.showNotification('Invalid Amount', 'Please enter a donation amount of at least KSH 100', 'error');
            return;
        }
        
        // Check if amount exceeds M-Pesa limit (using silent validation)
        const numericAmount = parseInt(donationAmount.toString().replace(/[^\d]/g, ''));
        if (numericAmount > this.MAX_DONATION) {
            // Silently adjust to max (already handled by silentDonationLimit)
            return;
        }
        
        try {
            this.showLoading();
            
            // Add donation to user data
            this.userData.donation = {
                amount: donationAmount,
                method: 'mpesa',
                processedThrough: 'CHACODEV',
                mpesaDetails: this.mpesaDetails,
                timestamp: new Date().toISOString()
            };
            
            // Submit donation to backend
            await this.submitFormData('individual_donation', this.userData);
            
            // Close payment modal and show success
            this.closeModal('individualPayment');
            
            // Show success modal with donation message
            this.elements.successMessage.textContent = `Thank you for your donation of KSH ${donationAmount}! Your registration is complete.`;
            
            // RESET THE FORM BEFORE SHOWING SUCCESS
            if (this.elements.registrationForm) {
                this.elements.registrationForm.reset();
                
                // Reset country to default
                if (this.elements.country) {
                    this.elements.country.value = 'KE';
                    this.updateIndividualPhoneCode();
                }
            }
            
            // Reset donation amount to default
            if (this.elements.individualDonationAmountModal) {
                this.elements.individualDonationAmountModal.value = '1000';
            }
            
            setTimeout(() => {
                this.openModal('success');
            }, 300);
            
            // Track event
            this.trackEvent('individual_donation_complete', {
                amount: donationAmount,
                currency: 'KES'
            });
            
        } catch (error) {
            console.error('Donation processing failed:', error);
            this.showNotification('Error', 'Donation failed. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    skipIndividualDonation() {
        // Close payment modal and show success
        this.closeModal('individualPayment');
        
        // Show success modal without donation
        this.elements.successMessage.textContent = 'Your registration is complete. Thank you for joining LVBICE!';
        
        // RESET THE FORM BEFORE SHOWING SUCCESS
        if (this.elements.registrationForm) {
            this.elements.registrationForm.reset();
            
            // Reset country to default
            if (this.elements.country) {
                this.elements.country.value = 'KE';
                this.updateIndividualPhoneCode();
            }
        }
        
        setTimeout(() => {
            this.openModal('success');
        }, 300);
        
        // Track event
        this.trackEvent('individual_registration_no_donation', {
            country: this.userData?.country
        });
    }
    
    registerLater() {
        // Close all modals
        this.closeModal('individualPayment');
        this.closeModal('membership');
        
        // Save draft
        if (this.userData) {
            this.saveDraft('registrationForm', this.userData);
        }
        
        // Show notification
        this.showNotification('Registration Saved', 'You can complete your registration later. We saved your progress.', 'info');
    }
    
    // ====================
    // ORGANIZATION REGISTRATION HANDLER
    // ====================
    
    async handleOrganizationRegistration(e) {
        this.orgData = {
            type: this.selectedOrgType,
            name: this.elements.orgName.value.trim(),
            category: this.elements.orgCategory.value,
            otherCategory: this.elements.orgCategory.value === 'other' ? this.elements.otherOrgName.value.trim() : '',
            contact: {
                name: this.elements.contactName.value.trim(),
                title: this.elements.contactTitle.value.trim(),
                email: this.elements.contactEmail.value.trim(),
                phone: this.elements.contactPhone.value,
                countryCode: this.elements.orgCountryCode.textContent,
                fullPhone: this.elements.orgCountryCode.textContent + this.elements.contactPhone.value
            },
            country: this.elements.orgCountry.value,
            agreedToTerms: this.elements.orgTerms.checked,
            timestamp: new Date().toISOString()
        };
        
        console.log('Organization registration:', this.orgData);
        
        try {
            // Show loading
            this.showLoading();
            
            // Save organization data temporarily
            await this.submitFormData('organization_preview', this.orgData);
            
            // Go to tier selection
            this.closeModal('membership');
            setTimeout(() => this.openModal('tier'), 300);
            
        } catch (error) {
            console.error('Organization registration failed:', error);
            this.showNotification('Error', 'Registration failed. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    getCategoryLabel(categoryValue) {
        const labels = {
            'government_ministry': 'Government Ministry',
            'county_government': 'County Government',
            'public_university': 'Public University',
            'research_institution': 'Research Institution',
            'regulatory_body': 'Regulatory Body',
            'parastatal': 'Parastatal',
            'public_hospital': 'Public Hospital',
            'other_state': 'Other State Agency',
            'ngo': 'Non-Governmental Organization (NGO)',
            'cbo': 'Community-Based Organization (CBO)',
            'fbo': 'Faith-Based Organization (FBO)',
            'private_company': 'Private Company',
            'manufacturer': 'Manufacturer',
            'consultancy': 'Consultancy Firm',
            'development_partner': 'Development Partner',
            'international_ngo': 'International NGO',
            'national_gov': 'National Government Agency',
            'local_gov': 'Local Government Agency',
            'public_institution': 'Public Institution',
            'government_department': 'Government Department',
            'state_corporation': 'State Corporation',
            'pbo': 'Public Benefit Organization (PBO)',
            'educational': 'Educational Institution',
            'research_institute': 'Research Institute',
            'community_organization': 'Community Organization',
            'professional_association': 'Professional Association',
            'faith_based': 'Faith-based Organization',
            'cooperative': 'Cooperative Society',
            'foundation': 'Foundation/Trust',
            'student_group': 'Student Organization',
            'other': 'Other'
        };
        return labels[categoryValue] || categoryValue;
    }
    
    // ====================
    // OLD DONATION HANDLING (for old modal)
    // ====================
    
    async handleDonation() {
        const amount = this.elements.donationAmount.value.trim();
        const method = this.elements.paymentMethod.value;
        
        // Check if amount exceeds M-Pesa limit (using silent validation)
        const numericAmount = parseInt(amount.toString().replace(/[^\d]/g, ''));
        if (numericAmount > this.MAX_DONATION) {
            // Silently adjusted by silentDonationLimit already
            return;
        }
        
        if (this.userData) {
            this.userData.donation = { amount, method, processedThrough: 'CHACODEV' };
        }
        
        try {
            this.showLoading();
            
            // Process donation
            await this.submitFormData('donation', {
                amount: amount,
                method: method,
                userData: this.userData
            });
            
            // Show notification instead of alert
            this.showNotification(
                'Donation Processed!',
                `Thank you for your ${this.formatCurrency(amount)} donation to LVBICE via ${this.getPaymentMethodName(method)}.`,
                'success'
            );
            
            this.completeRegistration();
            
        } catch (error) {
            console.error('Donation processing failed:', error);
            this.showNotification('Error', 'Donation failed. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    getPaymentMethodName(methodValue) {
        const methods = {
            'credit_card': 'Credit Card',
            'mpesa': 'M-Pesa',
            'bank_transfer': 'Bank Transfer',
            'paypal': 'PayPal'
        };
        return methods[methodValue] || methodValue;
    }
    
    // ====================
    // FIXED: PAYMENT HANDLING - REMOVED EXTRA MODAL
    // ====================
    
    // REMOVED: showMpesaInstructions() function - this was creating the extra modal
    
    // FIXED: Complete payment after M-Pesa payment (no extra modal)
    async completePayment(amount) {
        try {
            this.showLoading();
            
            // Add payment details to organization data
            if (this.orgData) {
                this.orgData.payment = { 
                    amount: amount, 
                    method: 'mpesa',
                    processedThrough: 'CHACODEV',
                    mpesaDetails: this.mpesaDetails,
                    timestamp: new Date().toISOString()
                };
            }
            
            // Submit payment to backend
            await this.submitFormData('payment', {
                amount: amount,
                tier: this.selectedTier,
                organizationData: this.orgData
            });
            
            // Show notification
            this.showNotification(
                'Payment Processed!',
                `Thank you for your ${this.formatCurrencyWithBoth(amount).ksh} payment for ${this.selectedTierLabel} membership via M-Pesa.`,
                'success'
            );
            
            // Track payment event
            this.trackEvent('payment_complete', {
                tier: this.selectedTier,
                amount: amount,
                currency: 'KES'
            });
            
            await this.completeOrganizationRegistration();
            
        } catch (error) {
            console.error('Payment processing failed:', error);
            this.showNotification('Error', 'Payment failed. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    // PREVENT PHONE FROM STARTING WITH COUNTRY CODE
    preventCountryCodeInPhone(e, formType) {
        const input = e.target;
        let value = input.value;
        const countryCode = formType === 'individual' ? 
            this.elements.indCountryCode?.textContent : this.elements.orgCountryCode?.textContent;
        
        if (!countryCode) return;
        
        // Remove the plus sign for checking
        const codeWithoutPlus = countryCode.replace('+', '');
        
        // Check if phone starts with country code (without +)
        if (value.startsWith(codeWithoutPlus)) {
            // Remove the country code from the beginning
            value = value.substring(codeWithoutPlus.length);
            input.value = value;
            
            // Show warning
            const hintElement = input.parentElement.nextElementSibling;
            if (hintElement && hintElement.classList.contains('phone-hint')) {
                const originalHint = hintElement.textContent;
                hintElement.textContent = 'Country code is already provided. Enter local number only.';
                hintElement.style.color = '#dc3545';
                
                // Reset after 3 seconds
                setTimeout(() => {
                    hintElement.textContent = originalHint;
                    hintElement.style.color = '';
                }, 3000);
            }
        }
    }
    
    // ====================
    // ENHANCEMENT METHODS IMPLEMENTATION
    // ====================
    
    // Loading states
    showLoading() {
        if (!this.elements.loadingOverlay) {
            this.elements.loadingOverlay = document.createElement('div');
            this.elements.loadingOverlay.className = 'loading-overlay';
            this.elements.loadingOverlay.innerHTML = '<div class="spinner"></div>';
            this.elements.loadingOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            `;
            
            const spinner = this.elements.loadingOverlay.querySelector('.spinner');
            spinner.style.cssText = `
                width: 50px;
                height: 50px;
                border: 5px solid #f3f3f3;
                border-top: 5px solid #00A94E;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            `;
            
            const style = document.createElement('style');
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(this.elements.loadingOverlay);
        }
        this.elements.loadingOverlay.style.display = 'flex';
    }
    
    hideLoading() {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.style.display = 'none';
        }
    }
    
    // Data persistence
    saveDraft(formType, data) {
        try {
            localStorage.setItem(`lvbice_draft_${formType}`, JSON.stringify(data));
            
            // Show draft saved indicator
            this.showDraftSavedIndicator();
        } catch (e) {
            console.error('Failed to save draft:', e);
        }
    }
    
    loadDraft(formType) {
        try {
            const draft = localStorage.getItem(`lvbice_draft_${formType}`);
            if (draft) {
                const data = JSON.parse(draft);
                this.populateFormFromDraft(formType, data);
                this.showNotification('Draft Loaded', 'Your previously saved form has been loaded', 'info');
                return data;
            }
        } catch (e) {
            console.error('Failed to load draft:', e);
        }
        return null;
    }
    
    populateFormFromDraft(formType, data) {
        const form = document.getElementById(formType);
        if (!form || !data) return;
        
        Object.keys(data).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = data[key];
                } else {
                    input.value = data[key];
                }
            }
        });
    }
    
    collectFormData(formId) {
        const form = document.getElementById(formId);
        const data = {};
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.name) {
                if (input.type === 'checkbox') {
                    data[input.name] = input.checked;
                } else if (input.type === 'radio') {
                    if (input.checked) {
                        data[input.name] = input.value;
                    }
                } else {
                    data[input.name] = input.value;
                }
            }
        });
        
        return data;
    }
    
    // Validation functions
    validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return emailRegex.test(email);
    }
    
    validatePhoneNumber(phone, countryCode) {
        const country = this.countryData.find(c => c.code === countryCode);
        if (!country) return false;
        
        // Check length
        if (phone.length !== country.digits) return false;
        
        // Check for valid digits
        return /^\d+$/.test(phone);
    }
    
    // Currency functions
    formatCurrency(amount, currency = 'KES') {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        
        return formatter.format(amount);
    }
    
    // Analytics/Event tracking
    trackEvent(eventName, data) {
        // For your own analytics
        console.log(`[Analytics] ${eventName}:`, data);
        
        // Send to your backend
        this.sendAnalytics(eventName, data);
    }
    
    async sendAnalytics(eventName, data) {
        try {
            await fetch('https://your-analytics-endpoint.com/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event: eventName,
                    data: data,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    language: navigator.language
                })
            });
        } catch (error) {
            console.error('Analytics error:', error);
        }
    }
    
    // Focus management for accessibility
    focusFirstInput(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            const firstInput = container.querySelector('input, select, button:not(.close-btn)');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }
    
    // Draft saved indicator
    showDraftSavedIndicator() {
        let indicator = document.querySelector('.draft-saved');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'draft-saved';
            indicator.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #00A94E;
                color: white;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 14px;
                z-index: 1000;
                animation: slideInUp 0.3s ease;
                display: none;
            `;
            document.body.appendChild(indicator);
            
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideInUp {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        indicator.textContent = 'Draft saved';
        indicator.style.display = 'block';
        
        // Auto-hide after 2 seconds
        setTimeout(() => {
            indicator.style.display = 'none';
        }, 2000);
    }
    
    // Form submission to backend
    async submitFormData(formType, data) {
        this.showLoading();
        
        try {
            // In a real implementation, you would send this to your backend
            console.log(`Submitting ${formType} data:`, data);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // For demo purposes, always return success
            return { success: true, message: 'Data submitted successfully' };
            
        } catch (error) {
            console.error(`Error submitting ${formType}:`, error);
            this.showNotification('Error', 'Failed to submit data. Please try again.', 'error');
            throw error;
        } finally {
            this.hideLoading();
        }
    }
    
    // ====================
    // COMPLETION FUNCTIONS
    // ====================
    
    completeRegistration() {
        this.closeModal('donation');
        
        // Reset individual form
        if (this.elements.registrationForm) {
            this.elements.registrationForm.reset();
        }
        
        // Reset donation form
        if (this.elements.donationAmount) {
            this.elements.donationAmount.value = '';
        }
        if (this.elements.paymentMethod) {
            this.elements.paymentMethod.value = '';
        }
        
        // Reset country code to default
        if (this.elements.country) {
            this.elements.country.value = 'KE';
            this.updateIndividualPhoneCode();
        }
        
        // Reset user data
        this.userData = null;
        
        // Clear drafts
        localStorage.removeItem('lvbice_draft_registrationForm');
        
        console.log('✅ Donation form reset after completion');
    }
    
    async completeOrganizationRegistration() {
        try {
            this.showLoading();
            
            // Submit final organization registration
            const finalData = {
                ...this.orgData,
                tier: this.selectedTier,
                tierLabel: this.selectedTierLabel,
                tierAmount: this.selectedTierAmount
            };
            
            await this.submitFormData('organization_final', finalData);
            
            // Create success message
            let successMessage = `Organization Registration Complete!\n\n`;
            
            if (this.orgData) {
                successMessage += `Organization: ${this.orgData.name}\n`;
                successMessage += `Category: ${this.getCategoryLabel(this.orgData.category)}\n`;
                
                // Include tier information if tier system is used
                if (this.selectedTier) {
                    successMessage += `Tier: ${this.selectedTierLabel}\n`;
                    if (this.selectedTier !== 'bronze') {
                        const currencies = this.formatCurrencyWithBoth(this.selectedTierAmount);
                        successMessage += `Payment: ${currencies.usd} (${currencies.ksh}) via M-Pesa\n`;
                    }
                }
                
                successMessage += `Contact: ${this.orgData.contact.name}\n`;
                successMessage += `Email: ${this.orgData.contact.email}\n`;
                successMessage += `Phone: ${this.orgData.contact.fullPhone}\n\n`;
            }
            
            successMessage += `Thank you for joining LVBICE!\n`;
            successMessage += `Your organization is now a member.`;
            
            // Show notification
            this.showNotification(
                'Organization Registration Complete!',
                successMessage,
                'success'
            );
            
            // Track completion
            this.trackEvent('organization_registration_complete', {
                organization_type: this.selectedOrgType,
                tier: this.selectedTier,
                country: this.orgData?.country
            });
            
            // Close any open modals
            this.closeModal('payment');
            this.closeModal('tier');
            this.closeModal('donation');
            this.closeModal('membership');
            
            // RESET ALL FORMS AFTER SUCCESS
            // Reset individual form if it exists
            if (this.elements.registrationForm) {
                this.elements.registrationForm.reset();
                console.log('Individual form reset');
            }
            
            // Reset organization form if it exists
            if (this.elements.organizationRegistrationForm) {
                this.elements.organizationRegistrationForm.reset();
                console.log('Organization form reset');
            }
            
            // Reset donation form if it exists (old modal)
            if (this.elements.donationAmount) {
                this.elements.donationAmount.value = '';
            }
            
            // Reset individual donation modal
            if (this.elements.individualDonationAmountModal) {
                this.elements.individualDonationAmountModal.value = '1000'; // Reset to default
            }
            
            // Reset all stored data
            this.userData = null;
            this.orgData = null;
            this.selectedOrgType = null;
            this.selectedTier = null;
            this.selectedTierAmount = 0;
            this.selectedTierLabel = '';
            this.silverSelection = null;
            
            // Clear drafts
            localStorage.removeItem('lvbice_draft_organizationRegistrationForm');
            localStorage.removeItem('lvbice_draft_registrationForm');
            
            console.log('✅ All forms and data reset after successful registration');
            
        } catch (error) {
            console.error('Organization completion failed:', error);
            this.showNotification('Error', 'Registration failed. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    // ====================
    // RESET FUNCTIONS
    // ====================
    
    resetForms() {
        if (this.elements.registrationForm) {
            this.elements.registrationForm.reset();
        }
        if (this.elements.donationAmount) {
            this.elements.donationAmount.value = '';
        }
        if (this.elements.paymentMethod) {
            this.elements.paymentMethod.value = '';
        }
        
        // Reset country code to default
        if (this.elements.country) {
            this.elements.country.value = 'KE';
            this.updateIndividualPhoneCode();
        }
        
        // Hide donation section (old)
        if (this.elements.donationSection) {
            this.elements.donationSection.style.display = 'none';
        }
        if (this.elements.makeDonation) {
            this.elements.makeDonation.checked = false;
        }
    }
    
    resetOrganizationForm() {
        if (this.elements.organizationRegistrationForm) {
            this.elements.organizationRegistrationForm.reset();
        }
        if (this.elements.orgCategory) {
            this.elements.orgCategory.innerHTML = '<option value="">Select category</option>';
        }
        
        if (this.elements.otherOrgNameGroup) {
            this.elements.otherOrgNameGroup.style.display = 'none';
        }
        if (this.elements.otherOrgName) {
            this.elements.otherOrgName.required = false;
        }
        
        // Reset country to default
        if (this.elements.orgCountry) {
            this.elements.orgCountry.value = 'KE';
            this.updateOrganizationPhoneCode();
        }
        
        // Reset tier selections
        if (this.elements.silverOptionButtons) {
            this.elements.silverOptionButtons.forEach(btn => {
                btn.classList.remove('active');
            });
        }
        
        if (this.elements.selectSilverBtn) {
            this.elements.selectSilverBtn.style.display = 'none';
        }
        
        // Reset stored selections
        this.silverSelection = null;
    }
    
    resetAllForms() {
        this.resetForms();
        this.resetOrganizationForm();
        
        // Clear all data
        this.userData = null;
        this.orgData = null;
        this.selectedOrgType = null;
        this.selectedTier = null;
        this.selectedTierAmount = 0;
        this.selectedTierLabel = '';
        this.silverSelection = null;
        
        // Clear all drafts
        localStorage.removeItem('lvbice_draft_registrationForm');
        localStorage.removeItem('lvbice_draft_organizationRegistrationForm');
        
        // Close all modals
        this.closeModal('membership');
        this.closeModal('donation');
        this.closeModal('tier');
        this.closeModal('payment');
        this.closeModal('individualPayment');
        this.closeModal('success');
        
        // Show notification
        this.showNotification('Forms Reset', 'All forms have been reset due to session timeout.', 'info');
    }
}
