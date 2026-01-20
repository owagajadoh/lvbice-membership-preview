// LVBICE Membership Application
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
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.populateCountries();
        console.log('LVBICE Membership App initialized');
    }
    
    cacheElements() {
        // Main button
        this.elements.becomeMemberBtn = document.getElementById('becomeMemberBtn');
        
        // Modals
        this.elements.membershipModal = document.getElementById('membershipModal');
        this.elements.donationModal = document.getElementById('donationModal');
        
        // Close buttons
        this.elements.closeModal = document.getElementById('closeModal');
        this.elements.closeDonationModal = document.getElementById('closeDonationModal');
        
        // Screens
        this.elements.selectionScreen = document.getElementById('selectionScreen');
        this.elements.individualForm = document.getElementById('individualForm');
        this.elements.organizationTypeScreen = document.getElementById('organizationTypeScreen');
        this.elements.organizationForm = document.getElementById('organizationForm');
        
        // Selection buttons
        this.elements.individualOption = document.getElementById('individualOption');
        this.elements.organizationOption = document.getElementById('organizationOption');
        
        // Organization type buttons
        this.elements.stateOrganization = document.getElementById('stateOrganization');
        this.elements.nonStateOrganization = document.getElementById('nonStateOrganization');
        
        // Back buttons
        this.elements.backToSelection = document.getElementById('backToSelection');
        this.elements.backToSelectionFromType = document.getElementById('backToSelectionFromType');
        this.elements.backToTypeSelection = document.getElementById('backToTypeSelection');
        
        // Forms and inputs - INDIVIDUAL
        this.elements.registrationForm = document.getElementById('registrationForm');
        this.elements.fullName = document.getElementById('fullName');
        this.elements.email = document.getElementById('email');
        this.elements.phone = document.getElementById('phone');
        this.elements.indCountryCode = document.getElementById('indCountryCode');
        this.elements.country = document.getElementById('country');
        this.elements.terms = document.getElementById('terms');
        
        // Forms and inputs - ORGANIZATION
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
        
        // Donation elements
        this.elements.donationAmount = document.getElementById('donationAmount');
        this.elements.paymentMethod = document.getElementById('paymentMethod');
        this.elements.submitDonation = document.getElementById('submitDonation');
        this.elements.skipDonation = document.getElementById('skipDonation');
        
        // Success notification
        this.elements.successNotification = document.getElementById('successNotification');
        this.elements.progressLine = document.querySelector('.progress-line');
    }
    
    bindEvents() {
        // Open main modal
        this.elements.becomeMemberBtn.addEventListener('click', () => this.openModal('membership'));
        
        // Close modals
        this.elements.closeModal.addEventListener('click', () => this.closeModal('membership'));
        this.elements.closeDonationModal.addEventListener('click', () => this.closeModal('donation'));
        
        // Close modals when clicking outside
        this.elements.membershipModal.addEventListener('click', (e) => {
            if (e.target === this.elements.membershipModal) this.closeModal('membership');
        });
        
        this.elements.donationModal.addEventListener('click', (e) => {
            if (e.target === this.elements.donationModal) this.closeModal('donation');
        });
        
        // Selection options
        this.elements.individualOption.addEventListener('click', () => {
            this.showScreen('individualForm');
            this.setupIndividualFormValidation();
        });
        this.elements.organizationOption.addEventListener('click', () => {
            this.selectedOrgType = null;
            this.showScreen('organizationTypeScreen');
        });
        
        // Organization type selection
        this.elements.stateOrganization.addEventListener('click', () => this.selectOrganizationType('state'));
        this.elements.nonStateOrganization.addEventListener('click', () => this.selectOrganizationType('non-state'));
        
        // Back buttons
        this.elements.backToSelection.addEventListener('click', () => this.showScreen('selectionScreen'));
        this.elements.backToSelectionFromType.addEventListener('click', () => this.showScreen('selectionScreen'));
        this.elements.backToTypeSelection.addEventListener('click', () => this.showScreen('organizationTypeScreen'));
        
        // Form submissions with validation
        this.elements.registrationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validateForm('registrationForm')) {
                this.handleRegistration(e);
            }
        });
        
        this.elements.organizationRegistrationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validateForm('organizationRegistrationForm')) {
                this.handleOrganizationRegistration(e);
            }
        });
        
        // Clear errors on input
        this.addInputValidationListeners();
        
        // Organization category change
        this.elements.orgCategory.addEventListener('change', () => this.handleOrgCategoryChange());
        
        // Country change for phone code (Individual)
        this.elements.country.addEventListener('change', () => this.updateIndividualPhoneCode());
        
        // Country change for phone code (Organization)
        this.elements.orgCountry.addEventListener('change', () => this.updateOrganizationPhoneCode());
        
        // Phone number input restrictions
        this.elements.phone.addEventListener('input', (e) => {
            this.restrictPhoneInput(e, 'individual');
            this.preventCountryCodeInPhone(e, 'individual');
        });
        this.elements.contactPhone.addEventListener('input', (e) => {
            this.restrictPhoneInput(e, 'organization');
            this.preventCountryCodeInPhone(e, 'organization');
        });
        
        // Name input restrictions
        this.elements.fullName.addEventListener('input', (e) => this.restrictNameInput(e));
        this.elements.contactName.addEventListener('input', (e) => this.restrictNameInput(e));
        
        // Email validation
        this.elements.email.addEventListener('input', (e) => this.validateEmailInput(e));
        this.elements.contactEmail.addEventListener('input', (e) => this.validateEmailInput(e));
        
        // Organization name restriction
        this.elements.orgName.addEventListener('input', (e) => this.restrictOrgNameInput(e));
        this.elements.contactTitle.addEventListener('input', (e) => this.restrictTitleInput(e));
        
        // Donation submission
        this.elements.submitDonation.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.validateDonationForm()) {
                this.handleDonation();
            }
        });
        
        // Skip donation link
        this.elements.skipDonation.addEventListener('click', () => this.completeRegistration());
        
        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.elements.membershipModal.style.display === 'flex') this.closeModal('membership');
                if (this.elements.donationModal.style.display === 'flex') this.closeModal('donation');
            }
        });
    }
    
    // NEW METHOD: PREVENT PHONE FROM STARTING WITH COUNTRY CODE
    preventCountryCodeInPhone(e, formType) {
        const input = e.target;
        let value = input.value;
        const countryCode = formType === 'individual' ? 
            this.elements.indCountryCode.textContent : this.elements.orgCountryCode.textContent;
        
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
    
    // FORM VALIDATION FUNCTIONS
    validateForm(formId) {
        const form = document.getElementById(formId);
        const inputs = form.querySelectorAll('input[required], select[required]');
        let firstError = null;
        
        // Clear previous errors
        form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        form.querySelectorAll('.error-message').forEach(el => el.classList.remove('show'));
        form.querySelectorAll('.checkbox-container').forEach(el => el.classList.remove('error'));
        
        // Validate each required field
        for (const input of inputs) {
            const errorId = input.id + 'Error';
            const errorElement = document.getElementById(errorId);
            let isValid = true;
            
            // Skip hidden fields
            if (input.offsetParent === null) continue;
            
            // Check checkbox differently
            if (input.type === 'checkbox') {
                isValid = input.checked;
                if (!isValid) {
                    const containerId = input.id + 'Container';
                    const container = document.getElementById(containerId);
                    if (container) container.classList.add('error');
                }
            } 
            // Check select
            else if (input.tagName === 'SELECT') {
                isValid = input.value !== '';
            }
            // Check text/email/tel inputs
            else {
                isValid = input.value.trim() !== '' && input.checkValidity();
            }
            
            // Show error if invalid
            if (!isValid) {
                input.classList.add('error');
                if (errorElement) {
                    errorElement.classList.add('show');
                }
                
                // Focus on first error
                if (!firstError) {
                    firstError = input;
                }
            }
        }
        
        // Focus on first error field
        if (firstError) {
            firstError.focus();
            return false;
        }
        
        return true;
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
            document.getElementById('donationAmountError').classList.add('show');
            isValid = false;
            firstError = amount;
        }
        
        // Validate payment method
        const method = this.elements.paymentMethod;
        if (!method.value) {
            method.classList.add('error');
            document.getElementById('paymentMethodError').classList.add('show');
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
        const individualInputs = this.elements.registrationForm.querySelectorAll('input, select');
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
        const organizationInputs = this.elements.organizationRegistrationForm.querySelectorAll('input, select');
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
        
        // Donation form input listeners
        this.elements.donationAmount.addEventListener('input', () => {
            this.elements.donationAmount.classList.remove('error');
            document.getElementById('donationAmountError').classList.remove('show');
        });
        
        this.elements.paymentMethod.addEventListener('change', () => {
            this.elements.paymentMethod.classList.remove('error');
            document.getElementById('paymentMethodError').classList.remove('show');
        });
    }
    
    // COUNTRY DATA
    getCountryData() {
        return [
            { code: 'KE', name: 'Kenya', phoneCode: '+254', digits: 9 },
            { code: 'TZ', name: 'Tanzania', phoneCode: '+255', digits: 9 },
            { code: 'UG', name: 'Uganda', phoneCode: '+256', digits: 9 },
            { code: 'RW', name: 'Rwanda', phoneCode: '+250', digits: 9 },
            { code: 'BI', name: 'Burundi', phoneCode: '+257', digits: 8 },
            { code: 'ET', name: 'Ethiopia', phoneCode: '+251', digits: 9 },
            { code: 'SS', name: 'South Sudan', phoneCode: '+211', digits: 9 },
            { code: 'CD', name: 'DR Congo', phoneCode: '+243', digits: 9 },
            { code: 'SO', name: 'Somalia', phoneCode: '+252', digits: 8 },
            { code: 'SD', name: 'Sudan', phoneCode: '+249', digits: 9 },
            { code: 'EG', name: 'Egypt', phoneCode: '+20', digits: 10 },
            { code: 'ZA', name: 'South Africa', phoneCode: '+27', digits: 9 },
            { code: 'NG', name: 'Nigeria', phoneCode: '+234', digits: 10 },
            { code: 'GH', name: 'Ghana', phoneCode: '+233', digits: 9 },
            { code: 'US', name: 'United States', phoneCode: '+1', digits: 10 },
            { code: 'GB', name: 'United Kingdom', phoneCode: '+44', digits: 10 },
            { code: 'FR', name: 'France', phoneCode: '+33', digits: 9 },
            { code: 'DE', name: 'Germany', phoneCode: '+49', digits: 10 },
            { code: 'CN', name: 'China', phoneCode: '+86', digits: 11 },
            { code: 'IN', name: 'India', phoneCode: '+91', digits: 10 }
        ];
    }
    
    populateCountries() {
        // Clear existing options
        this.elements.country.innerHTML = '<option value="">Select your country</option>';
        this.elements.orgCountry.innerHTML = '<option value="">Select country</option>';
        
        // Populate with country data
        this.countryData.forEach(country => {
            // Individual form
            const option1 = document.createElement('option');
            option1.value = country.code;
            option1.textContent = `${country.name} (${country.phoneCode})`;
            this.elements.country.appendChild(option1);
            
            // Organization form
            const option2 = document.createElement('option');
            option2.value = country.code;
            option2.textContent = `${country.name} (${country.phoneCode})`;
            this.elements.orgCountry.appendChild(option2);
        });
        
        // Set default to Kenya
        this.elements.country.value = 'KE';
        this.elements.orgCountry.value = 'KE';
        this.updateIndividualPhoneCode();
        this.updateOrganizationPhoneCode();
    }
    
    updateIndividualPhoneCode() {
        const countryCode = this.elements.country.value;
        const country = this.countryData.find(c => c.code === countryCode);
        if (country) {
            this.elements.indCountryCode.textContent = country.phoneCode;
            this.elements.phone.pattern = `[0-9]{${country.digits}}`;
            this.elements.phone.maxLength = country.digits;
            this.elements.phone.placeholder = `${'X'.repeat(country.digits)}`;
            this.elements.phone.title = `${country.digits}-digit phone number required`;
            this.selectedCountry = countryCode;
        }
    }
    
    updateOrganizationPhoneCode() {
        const countryCode = this.elements.orgCountry.value;
        const country = this.countryData.find(c => c.code === countryCode);
        if (country) {
            this.elements.orgCountryCode.textContent = country.phoneCode;
            this.elements.contactPhone.pattern = `[0-9]{${country.digits}}`;
            this.elements.contactPhone.maxLength = country.digits;
            this.elements.contactPhone.placeholder = `${'X'.repeat(country.digits)}`;
            this.elements.contactPhone.title = `${country.digits}-digit phone number required`;
        }
    }
    
    // INPUT RESTRICTION FUNCTIONS
    restrictPhoneInput(e, formType) {
        // Remove all non-digit characters
        let value = e.target.value.replace(/[^\d]/g, '');
        
        // Get the country for digit limit
        const countryCode = formType === 'individual' ? 
            this.elements.country.value : this.elements.orgCountry.value;
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && emailRegex.test(email)) {
            return true;
        } else {
            return false;
        }
    }
    
    setupIndividualFormValidation() {
        // Initialize all fields with current validation
        this.restrictNameInput({ target: this.elements.fullName });
        this.validateEmailInput({ target: this.elements.email });
        this.restrictPhoneInput({ target: this.elements.phone }, 'individual');
    }
    
    // SCREEN MANAGEMENT
    openModal(modalType) {
        if (modalType === 'membership') {
            this.elements.membershipModal.style.display = 'flex';
            this.showScreen('selectionScreen');
        } else if (modalType === 'donation') {
            this.elements.donationModal.style.display = 'flex';
        }
        document.body.style.overflow = 'hidden';
    }
    
    closeModal(modalType) {
        if (modalType === 'membership') {
            this.elements.membershipModal.style.display = 'none';
        } else if (modalType === 'donation') {
            this.elements.donationModal.style.display = 'none';
        }
        document.body.style.overflow = 'auto';
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
    
    // ORGANIZATION TYPE SELECTION
    selectOrganizationType(type) {
        this.selectedOrgType = type;
        
        const descriptions = {
            'state': 'State organizations include government agencies, public institutions, and government bodies.',
            'non-state': 'Non-state organizations include PBOs, NGOs, private companies, manufacturers, and civil society organizations.'
        };
        
        this.elements.orgTypeDescription.textContent = descriptions[type] || '';
        this.populateOrganizationCategories(type);
        this.showScreen('organizationForm');
    }
    
    populateOrganizationCategories(type) {
        this.elements.orgCategory.innerHTML = '<option value="">Select category</option>';
        this.elements.otherOrgNameGroup.style.display = 'none';
        this.elements.otherOrgName.required = false;
        
        const categories = {
            'state': [
                { value: 'national_gov', label: 'National Government Agency' },
                { value: 'local_gov', label: 'Local Government Agency' },
                { value: 'public_institution', label: 'Public Institution' },
                { value: 'government_department', label: 'Government Department' },
                { value: 'state_corporation', label: 'State Corporation' }
            ],
            'non-state': [
                { value: 'pbo', label: 'Public Benefit Organization (PBO)' },
                { value: 'ngo', label: 'Non-Governmental Organization (NGO)' },
                { value: 'manufacturer', label: 'Manufacturing Company' },
                { value: 'private_company', label: 'Private Company' },
                { value: 'educational', label: 'Educational Institution' },
                { value: 'research_institute', label: 'Research Institute' },
                { value: 'community_organization', label: 'Community Organization' },
                { value: 'professional_association', label: 'Professional Association' },
                { value: 'faith_based', label: 'Faith-based Organization' },
                { value: 'cooperative', label: 'Cooperative Society' },
                { value: 'foundation', label: 'Foundation/Trust' },
                { value: 'student_group', label: 'Student Organization' }
            ]
        };
        
        const orgCategories = categories[type] || [];
        orgCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.value;
            option.textContent = category.label;
            this.elements.orgCategory.appendChild(option);
        });
        
        // Add "Other" option
        const otherOption = document.createElement('option');
        otherOption.value = 'other';
        otherOption.textContent = 'Other (Specify below)';
        this.elements.orgCategory.appendChild(otherOption);
    }
    
    handleOrgCategoryChange() {
        const isOther = this.elements.orgCategory.value === 'other';
        this.elements.otherOrgNameGroup.style.display = isOther ? 'block' : 'none';
        this.elements.otherOrgName.required = isOther;
        
        if (!isOther) {
            this.elements.otherOrgName.value = '';
        }
    }
    
    // INDIVIDUAL REGISTRATION
    handleRegistration(e) {
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
        
        console.log('Individual registration:', this.userData);
        
        this.closeModal('membership');
        setTimeout(() => this.openModal('donation'), 300);
    }
    
    // ORGANIZATION REGISTRATION
    handleOrganizationRegistration(e) {
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
        
        const successMessage = `✅ Organization Application Submitted!\n\n` +
                              `Organization: ${this.orgData.name}\n` +
                              `Category: ${this.getCategoryLabel(this.orgData.category)}\n` +
                              `Contact: ${this.orgData.contact.name}\n` +
                              `Email: ${this.orgData.contact.email}\n` +
                              `Phone: ${this.orgData.contact.fullPhone}\n\n` +
                              `Your application has been received.\n` +
                              `For assistance: customerservice@lvbice.com`;
        
        alert(successMessage);
        this.completeOrganizationRegistration();
    }
    
    getCategoryLabel(categoryValue) {
        const labels = {
            'national_gov': 'National Government Agency',
            'local_gov': 'Local Government Agency',
            'public_institution': 'Public Institution',
            'government_department': 'Government Department',
            'state_corporation': 'State Corporation',
            'pbo': 'Public Benefit Organization (PBO)',
            'ngo': 'Non-Governmental Organization (NGO)',
            'manufacturer': 'Manufacturing Company',
            'private_company': 'Private Company',
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
    
    // DONATION HANDLING
    handleDonation() {
        const amount = this.elements.donationAmount.value.trim();
        const method = this.elements.paymentMethod.value;
        
        if (this.userData) {
            this.userData.donation = { amount, method, processedThrough: 'CHACODEV' };
        }
        
        const donationMessage = `✅ Donation Processed!\n\n` +
                              `Amount: $${amount}\n` +
                              `Method: ${this.getPaymentMethodName(method)}\n` +
                              `Thank you for supporting LVBICE!`;
        
        alert(donationMessage);
        this.completeRegistration();
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
    
    // COMPLETION FUNCTIONS
    completeRegistration() {
        this.closeModal('donation');
        this.resetForms();
        this.showSuccessNotification();
        this.userData = null;
    }
    
    completeOrganizationRegistration() {
        this.closeModal('membership');
        this.resetOrganizationForm();
        this.showSuccessNotification();
        this.selectedOrgType = null;
        this.orgData = null;
    }
    
    // RESET FUNCTIONS
    resetForms() {
        if (this.elements.registrationForm) this.elements.registrationForm.reset();
        if (this.elements.donationAmount) this.elements.donationAmount.value = '';
        if (this.elements.paymentMethod) this.elements.paymentMethod.value = '';
        
        // Reset country code to default
        this.elements.country.value = 'KE';
        this.updateIndividualPhoneCode();
    }
    
    resetOrganizationForm() {
        if (this.elements.organizationRegistrationForm) this.elements.organizationRegistrationForm.reset();
        if (this.elements.orgCategory) {
            this.elements.orgCategory.innerHTML = '<option value="">Select category</option>';
        }
        
        this.elements.otherOrgNameGroup.style.display = 'none';
        this.elements.otherOrgName.required = false;
        
        // Reset country to default
        this.elements.orgCountry.value = 'KE';
        this.updateOrganizationPhoneCode();
    }
    
    // SUCCESS NOTIFICATION
    showSuccessNotification() {
        this.elements.successNotification.style.display = 'flex';
        this.elements.progressLine.classList.add('active');
        
        setTimeout(() => {
            this.elements.successNotification.style.display = 'none';
            this.elements.progressLine.classList.remove('active');
        }, 3000);
    }
}