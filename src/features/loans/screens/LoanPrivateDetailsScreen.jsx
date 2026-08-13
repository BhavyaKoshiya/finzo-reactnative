import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  FileText,
  ShieldCheck,
  Building,
  UserCheck,
  Calendar,
  AlertTriangle,
  BookOpen,
  Info,
  PhoneCall,
  Save,
} from 'lucide-react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import AppHeader from '../../../components/navigation/AppHeader';
import AppText from '../../../components/common/AppText';
import AppCard from '../../../components/cards/AppCard';
import AppIcon from '../../../components/common/AppIcon';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import SecondaryButton from '../../../components/buttons/SecondaryButton';
import TextInputField from '../../../components/forms/TextInputField';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { selectLoanProfileById } from '../../../store/slices/loanProfilesSlice';
import {
  selectPrivateDetailsByLoanId,
  setLoanPrivateDetails,
  clearLoanPrivateDetails,
} from '../../../store/slices/loanPrivateDetailsSlice';
import { selectLoanNotesByLoanId, deleteNotesForLoan } from '../../../store/slices/loanNotesSlice';
import { createLoanPrivateDetails } from '../types/loanPrivateDetailsTypes';
import { maskAccountReference } from '../utils/accountNumberMaskingUtils';
import securePrivateStorageService from '../../../services/securePrivateStorageService';
import { ROUTES } from '../../../navigation/routes';

export const LoanPrivateDetailsScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { currentTheme } = useAppTheme();

  const loanId = route?.params?.loanId;
  const loan = useSelector((state) => selectLoanProfileById(state, loanId));
  const existingDetails = useSelector((state) => selectPrivateDetailsByLoanId(state, loanId));
  const notes = useSelector((state) => selectLoanNotesByLoanId(state, loanId));

  const [isEditing, setIsEditing] = useState(false);
  const [showAccountRef, setShowAccountRef] = useState(false);
  const [showSensitiveSecret, setShowSensitiveSecret] = useState(false);

  // Form State
  const [lenderName, setLenderName] = useState('');
  const [loanAccountReference, setLoanAccountReference] = useState('');
  const [customerReference, setCustomerReference] = useState('');
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchContact, setBranchContact] = useState('');
  const [loanOfficerName, setLoanOfficerName] = useState('');
  const [loanOfficerContact, setLoanOfficerContact] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insurancePolicyReference, setInsurancePolicyReference] = useState('');
  const [collateralDescription, setCollateralDescription] = useState('');
  const [importantDates, setImportantDates] = useState('');
  const [sensitiveSecret, setSensitiveSecret] = useState('');
  const [loadedSecret, setLoadedSecret] = useState('');

  const secretStorageKey = `finzo.loan.${loanId}.sensitive.credential`;

  useEffect(() => {
    if (existingDetails) {
      setLenderName(existingDetails.lenderName || '');
      setLoanAccountReference(existingDetails.loanAccountReference || '');
      setCustomerReference(existingDetails.customerReference || '');
      setBranchName(existingDetails.branchName || '');
      setBranchAddress(existingDetails.branchAddress || '');
      setBranchContact(existingDetails.branchContact || '');
      setLoanOfficerName(existingDetails.loanOfficerName || '');
      setLoanOfficerContact(existingDetails.loanOfficerContact || '');
      setInsuranceProvider(existingDetails.insuranceProvider || '');
      setInsurancePolicyReference(existingDetails.insurancePolicyReference || '');
      setCollateralDescription(existingDetails.collateralDescription || '');
      setImportantDates(existingDetails.importantDates || '');
    }
  }, [existingDetails]);

  useEffect(() => {
    // Load secure credential if flagged
    if (existingDetails?.hasSecureCredential) {
      securePrivateStorageService.getSecureValue(secretStorageKey).then((val) => {
        if (val) setLoadedSecret(val);
      }).catch(() => {
        // Silently tolerate or present retry
      });
    }
  }, [existingDetails, secretStorageKey]);

  if (!loan) {
    return (
      <ScreenContainer
        header={
          <AppHeader
            title="Private Details"
            leftAction={{ icon: ArrowLeft, onPress: () => navigation.goBack() }}
          />
        }
      >
        <View style={styles.notFound}>
          <AppText variant="bodyMedium">Loan profile not found.</AppText>
        </View>
      </ScreenContainer>
    );
  }

  const handleSave = async () => {
    try {
      let hasCredential = Boolean(existingDetails?.hasSecureCredential);

      if (sensitiveSecret.trim()) {
        await securePrivateStorageService.setSecureValue(secretStorageKey, sensitiveSecret.trim());
        setLoadedSecret(sensitiveSecret.trim());
        hasCredential = true;
      }

      const updated = createLoanPrivateDetails({
        loanId: loan.id,
        lenderName,
        loanAccountReference,
        customerReference,
        branchName,
        branchAddress,
        branchContact,
        loanOfficerName,
        loanOfficerContact,
        insuranceProvider,
        insurancePolicyReference,
        collateralDescription,
        importantDates,
        hasSecureCredential: hasCredential,
      });

      dispatch(setLoanPrivateDetails(updated));
      setIsEditing(false);
      setSensitiveSecret('');
      Alert.alert('Saved', 'Private loan details updated successfully.');
    } catch (err) {
      Alert.alert('Security Error', err.message || "Sensitive information couldn't be securely stored on this device.");
    }
  };

  const handleClearAllPrivateData = () => {
    Alert.alert(
      'Clear Private Details',
      'This will permanently remove private notes, lender details and sensitive information stored for this loan. Your financial balance, payments and loan profile will NOT be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Private Details',
          style: 'destructive',
          onPress: async () => {
            dispatch(clearLoanPrivateDetails(loan.id));
            dispatch(deleteNotesForLoan(loan.id));
            await securePrivateStorageService.deleteSecureValue(secretStorageKey);
            setLoadedSecret('');
            Alert.alert('Cleared', 'Private loan details and notes removed for this loan.');
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader
          title="Private Loan Details"
          subtitle={loan.name}
          leftAction={{ icon: ArrowLeft, onPress: () => navigation.goBack() }}
        />
      }
    >
      <View style={styles.container}>
        {/* Privacy Education Card */}
        <AppCard style={[styles.privacyCard, { borderColor: currentTheme.primary }]}>
          <View style={styles.privacyTopRow}>
            <AppIcon icon={Lock} size={20} color={currentTheme.primary} style={{ marginRight: 8 }} />
            <AppText variant="cardTitle" color={currentTheme.primary} style={{ fontWeight: '800' }}>
              Your Data Stays On This Device
            </AppText>
          </View>
          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={{ marginBottom: 10, lineHeight: 18 }}>
            Loan details, notes and private information are stored locally on this device and are not uploaded to Finzo or Firebase.
          </AppText>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOCAL_DATA_PRIVACY)}>
            <AppText variant="bodySmall" color={currentTheme.primary} style={{ fontWeight: '700' }}>
              Learn More about Privacy →
            </AppText>
          </TouchableOpacity>
        </AppCard>

        {/* Banking Security Warning */}
        <AppCard style={[styles.warningCard, { backgroundColor: currentTheme.warning + '15', borderColor: currentTheme.warning }]}>
          <View style={styles.warningHeader}>
            <AppIcon icon={AlertTriangle} size={18} color={currentTheme.warning} style={{ marginRight: 6 }} />
            <AppText variant="caption" color={currentTheme.warning} style={{ fontWeight: '800' }}>
              SECURITY NOTICE
            </AppText>
          </View>
          <AppText variant="bodySmall" color={currentTheme.textPrimary} style={{ fontSize: 12, lineHeight: 17 }}>
            For your security, avoid storing banking passwords, PINs, OTPs or card security codes in Finzo.
          </AppText>
        </AppCard>

        {/* View vs Edit Controls */}
        <View style={styles.topControlRow}>
          <SecondaryButton
            title={isEditing ? 'Cancel Edit' : 'Edit Details'}
            icon={Edit3}
            onPress={() => setIsEditing(!isEditing)}
          />
        </View>

        {isEditing ? (
          /* EDIT FORM MODE */
          <AppCard style={styles.formCard}>
            <AppText variant="sectionTitle" style={styles.sectionHeaderTitle}>Edit Private Information</AppText>

            <TextInputField label="Lender Name" value={lenderName} onChangeText={setLenderName} placeholder="e.g. HDFC Bank" />
            <TextInputField label="Loan Account / Ref Number" value={loanAccountReference} onChangeText={setLoanAccountReference} placeholder="e.g. L123456789" />
            <TextInputField label="Customer Reference ID" value={customerReference} onChangeText={setCustomerReference} placeholder="e.g. CUST9876" />
            <TextInputField label="Branch Name" value={branchName} onChangeText={setBranchName} placeholder="e.g. MG Road Branch" />
            <TextInputField label="Branch Address" value={branchAddress} onChangeText={setBranchAddress} placeholder="e.g. 123 Main St, City" />
            <TextInputField label="Branch Contact Phone" value={branchContact} onChangeText={setBranchContact} keyboardType="phone-pad" />
            <TextInputField label="Loan Officer Name" value={loanOfficerName} onChangeText={setLoanOfficerName} />
            <TextInputField label="Loan Officer Phone" value={loanOfficerContact} onChangeText={setLoanOfficerContact} keyboardType="phone-pad" />
            <TextInputField label="Insurance Provider" value={insuranceProvider} onChangeText={setInsuranceProvider} />
            <TextInputField label="Insurance Policy Number" value={insurancePolicyReference} onChangeText={setInsurancePolicyReference} />
            <TextInputField label="Collateral Description" value={collateralDescription} onChangeText={setCollateralDescription} multiline numberOfLines={2} />
            <TextInputField label="Important Dates / Milestones" value={importantDates} onChangeText={setImportantDates} placeholder="e.g. Reset Date: March 2027" />

            {/* Protected Sensitive Field */}
            <View style={styles.sensitiveBox}>
              <AppText variant="bodySmall" style={{ fontWeight: '700', marginBottom: 4 }}>
                🔐 Sensitive Identifier (Protected by Device Keychain)
              </AppText>
              <TextInputField
                label="Protected Secret / Identifier"
                value={sensitiveSecret}
                onChangeText={setSensitiveSecret}
                secureTextEntry
                placeholder="Enter sensitive key/reference if needed"
              />
            </View>

            <PrimaryButton title="Save Private Details" icon={Save} onPress={handleSave} style={{ marginTop: 12 }} />
          </AppCard>
        ) : (
          /* READ-ONLY DISPLAY MODE */
          <View style={styles.detailsGroup}>
            {/* Notes Section Quick Link */}
            <AppCard style={styles.notesBannerCard}>
              <View style={styles.notesHeaderRow}>
                <View style={styles.notesTitleGroup}>
                  <AppIcon icon={BookOpen} size={20} color={currentTheme.primary} style={{ marginRight: 8 }} />
                  <AppText variant="cardTitle">Loan Notes ({notes.length})</AppText>
                </View>
                <SecondaryButton
                  title="View Notes"
                  onPress={() => navigation.navigate(ROUTES.LOAN_NOTES, { loanId: loan.id })}
                />
              </View>
            </AppCard>

            {/* Lender Info Card */}
            <AppCard style={styles.infoCard}>
              <AppText variant="sectionTitle" style={styles.cardHeaderTitle}>Lender & Branch Details</AppText>

              <View style={styles.rowItem}>
                <AppText variant="caption" color={currentTheme.textMuted}>Lender Name</AppText>
                <AppText variant="bodyMedium" style={{ fontWeight: '700' }}>{lenderName || 'Not specified'}</AppText>
              </View>

              <View style={styles.rowItem}>
                <AppText variant="caption" color={currentTheme.textMuted}>Loan Account / Ref #</AppText>
                <View style={styles.maskedRow}>
                  <AppText variant="bodyMedium" style={{ fontWeight: '700', fontFamily: 'monospace' }}>
                    {showAccountRef ? loanAccountReference || 'None' : maskAccountReference(loanAccountReference) || 'None'}
                  </AppText>
                  {loanAccountReference ? (
                    <TouchableOpacity onPress={() => setShowAccountRef(!showAccountRef)} style={{ marginLeft: 8 }}>
                      <AppIcon icon={showAccountRef ? EyeOff : Eye} size={18} color={currentTheme.primary} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>

              <View style={styles.rowItem}>
                <AppText variant="caption" color={currentTheme.textMuted}>Customer Reference ID</AppText>
                <AppText variant="bodyMedium">{customerReference || 'Not specified'}</AppText>
              </View>

              <View style={styles.rowItem}>
                <AppText variant="caption" color={currentTheme.textMuted}>Branch</AppText>
                <AppText variant="bodyMedium">{branchName ? `${branchName} ${branchAddress ? `(${branchAddress})` : ''}` : 'Not specified'}</AppText>
              </View>

              <View style={styles.rowItem}>
                <AppText variant="caption" color={currentTheme.textMuted}>Branch Phone</AppText>
                <AppText variant="bodyMedium">{branchContact || 'Not specified'}</AppText>
              </View>
            </AppCard>

            {/* Contacts & Officer Card */}
            <AppCard style={styles.infoCard}>
              <AppText variant="sectionTitle" style={styles.cardHeaderTitle}>Loan Officer & Contact</AppText>
              <View style={styles.rowItem}>
                <AppText variant="caption" color={currentTheme.textMuted}>Loan Officer Name</AppText>
                <AppText variant="bodyMedium">{loanOfficerName || 'Not specified'}</AppText>
              </View>
              <View style={styles.rowItem}>
                <AppText variant="caption" color={currentTheme.textMuted}>Contact Number</AppText>
                <AppText variant="bodyMedium">{loanOfficerContact || 'Not specified'}</AppText>
              </View>
            </AppCard>

            {/* Insurance & Collateral */}
            <AppCard style={styles.infoCard}>
              <AppText variant="sectionTitle" style={styles.cardHeaderTitle}>Insurance & Collateral</AppText>
              <View style={styles.rowItem}>
                <AppText variant="caption" color={currentTheme.textMuted}>Insurance Provider</AppText>
                <AppText variant="bodyMedium">{insuranceProvider || 'Not specified'}</AppText>
              </View>
              <View style={styles.rowItem}>
                <AppText variant="caption" color={currentTheme.textMuted}>Policy Reference #</AppText>
                <AppText variant="bodyMedium">{insurancePolicyReference || 'Not specified'}</AppText>
              </View>
              <View style={styles.rowItem}>
                <AppText variant="caption" color={currentTheme.textMuted}>Collateral Description</AppText>
                <AppText variant="bodyMedium">{collateralDescription || 'Not specified'}</AppText>
              </View>
            </AppCard>

            {/* Protected Credential Display */}
            {loadedSecret ? (
              <AppCard style={[styles.infoCard, { borderColor: currentTheme.primary }]}>
                <AppText variant="sectionTitle" style={styles.cardHeaderTitle}>🔐 Sensitive Identifier</AppText>
                <AppText variant="caption" color={currentTheme.textMuted} style={{ marginBottom: 6 }}>
                  Protected by device Keychain secure storage
                </AppText>
                <View style={styles.maskedRow}>
                  <AppText variant="bodyMedium" style={{ fontWeight: '800', fontFamily: 'monospace' }}>
                    {showSensitiveSecret ? loadedSecret : '••••••••••••'}
                  </AppText>
                  <TouchableOpacity onPress={() => setShowSensitiveSecret(!showSensitiveSecret)} style={{ marginLeft: 10 }}>
                    <AppIcon icon={showSensitiveSecret ? EyeOff : Eye} size={20} color={currentTheme.primary} />
                  </TouchableOpacity>
                </View>
              </AppCard>
            ) : null}

            {/* Clear Action */}
            <SecondaryButton
              title="Clear Private Details & Notes"
              icon={Trash2}
              onPress={handleClearAllPrivateData}
              style={{ borderColor: currentTheme.error, marginTop: 10 }}
            />
          </View>
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  notFound: {
    alignItems: 'center',
    padding: 32,
  },
  container: {
    gap: 14,
    paddingBottom: 40,
  },
  privacyCard: {
    padding: 16,
    borderWidth: 1.5,
  },
  privacyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  warningCard: {
    padding: 12,
    borderWidth: 1,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  topControlRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  formCard: {
    padding: 16,
    gap: 10,
  },
  sectionHeaderTitle: {
    marginBottom: 10,
  },
  sensitiveBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailsGroup: {
    gap: 14,
  },
  notesBannerCard: {
    padding: 16,
  },
  notesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notesTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoCard: {
    padding: 16,
    gap: 10,
  },
  cardHeaderTitle: {
    marginBottom: 6,
  },
  rowItem: {
    flexDirection: 'column',
    gap: 2,
  },
  maskedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default LoanPrivateDetailsScreen;
