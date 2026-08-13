import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Pin,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  X,
  Save,
  Tag,
} from 'lucide-react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import AppHeader from '../../../components/navigation/AppHeader';
import AppText from '../../../components/common/AppText';
import AppCard from '../../../components/cards/AppCard';
import AppIcon from '../../../components/common/AppIcon';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import SecondaryButton from '../../../components/buttons/SecondaryButton';
import TextInputField from '../../../components/forms/TextInputField';
import SelectField from '../../../components/forms/SelectField';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { selectLoanProfileById } from '../../../store/slices/loanProfilesSlice';
import {
  selectLoanNotesByLoanId,
  addLoanNote,
  updateLoanNote,
  deleteLoanNote,
  toggleLoanNotePinned,
} from '../../../store/slices/loanNotesSlice';
import { NOTE_CATEGORIES, MAX_NOTES_PER_LOAN, createLoanNote } from '../types/loanNoteTypes';
import { formatLoanDate } from '../utils/loanDateUtils';

const CATEGORY_OPTIONS = Object.values(NOTE_CATEGORIES).map((cat) => ({
  label: cat,
  value: cat,
}));

export const LoanNotesScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { currentTheme, isDark } = useAppTheme();

  const loanId = route?.params?.loanId;
  const loan = useSelector((state) => selectLoanProfileById(state, loanId));
  const notes = useSelector((state) => selectLoanNotesByLoanId(state, loanId));

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState(NOTE_CATEGORIES.GENERAL);

  if (!loan) {
    return (
      <ScreenContainer
        header={
          <AppHeader
            title="Loan Notes"
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

  const handleOpenAddModal = () => {
    if (notes.length >= MAX_NOTES_PER_LOAN) {
      Alert.alert('Maximum Notes Reached', "You've reached the maximum number of notes for this loan.");
      return;
    }
    setEditingNoteId(null);
    setTitle('');
    setBody('');
    setCategory(NOTE_CATEGORIES.GENERAL);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (note) => {
    setEditingNoteId(note.id);
    setTitle(note.title);
    setBody(note.body);
    setCategory(note.category);
    setIsModalOpen(true);
  };

  const handleSaveNote = () => {
    if (!title.trim() && !body.trim()) {
      Alert.alert('Empty Note', 'Please provide a title or body content for the note.');
      return;
    }

    if (editingNoteId) {
      dispatch(
        updateLoanNote({
          id: editingNoteId,
          updates: { title, body, category },
        })
      );
    } else {
      const newNote = createLoanNote({ loanId: loan.id, title, body, category });
      dispatch(addLoanNote(newNote));
    }

    setIsModalOpen(false);
  };

  const handleDeleteNote = (noteId) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => dispatch(deleteLoanNote(noteId)),
      },
    ]);
  };

  // Filter & Search Logic
  const filteredNotes = notes.filter((n) => {
    const matchesCategory =
      selectedCategoryFilter === 'All' || n.category === selectedCategoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      n.title.toLowerCase().includes(q) ||
      n.body.toLowerCase().includes(q) ||
      n.category.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned);

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader
          title="Loan Notes"
          subtitle={loan.name}
          leftAction={{ icon: ArrowLeft, onPress: () => navigation.goBack() }}
          rightAction={{ icon: Plus, onPress: handleOpenAddModal }}
        />
      }
    >
      <View style={styles.container}>
        {/* Search & Add Bar */}
        <View style={styles.topControlRow}>
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: isDark ? currentTheme.surface : '#FFFFFF',
                borderColor: currentTheme.border,
              },
            ]}
          >
            <AppIcon icon={Search} size={18} color={currentTheme.textMuted} style={styles.searchIcon} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search notes..."
              placeholderTextColor={currentTheme.textMuted}
              style={[styles.searchInputText, { color: currentTheme.textPrimary }]}
            />
            {searchQuery ? (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <AppIcon icon={X} size={16} color={currentTheme.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>
          <PrimaryButton
            title="Add Note"
            icon={Plus}
            onPress={handleOpenAddModal}
            style={styles.addBtnInline}
          />
        </View>

        {/* Category Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {['All', ...Object.values(NOTE_CATEGORIES)].map((cat) => {
            const isActive = selectedCategoryFilter === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategoryFilter(cat)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isActive ? currentTheme.primary : currentTheme.surface,
                    borderColor: isActive ? currentTheme.primary : currentTheme.border,
                  },
                ]}
              >
                <AppText
                  variant="caption"
                  color={isActive ? '#FFFFFF' : currentTheme.textSecondary}
                  style={{ fontWeight: isActive ? '700' : '500' }}
                >
                  {cat}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Notes List */}
        {filteredNotes.length > 0 ? (
          <View style={styles.notesListGroup}>
            {/* Pinned Section */}
            {pinnedNotes.length > 0 && (
              <View style={styles.sectionBlock}>
                <AppText variant="sectionTitle" style={{ marginBottom: 8 }}>📌 Pinned Notes ({pinnedNotes.length})</AppText>
                {pinnedNotes.map((note) => (
                  <AppCard key={note.id} style={styles.noteCard}>
                    <View style={styles.noteTopRow}>
                      <View style={styles.catBadge}>
                        <AppText variant="caption" color={currentTheme.primary} style={{ fontWeight: '700' }}>
                          {note.category}
                        </AppText>
                      </View>
                      <View style={styles.noteActionRow}>
                        <TouchableOpacity onPress={() => dispatch(toggleLoanNotePinned(note.id))} style={styles.iconBtn}>
                          <AppIcon icon={Pin} size={18} color={currentTheme.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleOpenEditModal(note)} style={styles.iconBtn}>
                          <AppIcon icon={Edit3} size={18} color={currentTheme.textMuted} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteNote(note.id)} style={styles.iconBtn}>
                          <AppIcon icon={Trash2} size={18} color={currentTheme.error} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <AppText variant="cardTitle" style={{ marginBottom: 4 }}>{note.title}</AppText>
                    {note.body ? (
                      <AppText variant="bodySmall" color={currentTheme.textSecondary} style={{ marginBottom: 8 }}>
                        {note.body}
                      </AppText>
                    ) : null}
                    <AppText variant="caption" color={currentTheme.textMuted}>{formatLoanDate(note.createdAt)}</AppText>
                  </AppCard>
                ))}
              </View>
            )}

            {/* Other Notes Section */}
            {unpinnedNotes.length > 0 && (
              <View style={styles.sectionBlock}>
                {pinnedNotes.length > 0 && <AppText variant="sectionTitle" style={{ marginBottom: 8 }}>Other Notes</AppText>}
                {unpinnedNotes.map((note) => (
                  <AppCard key={note.id} style={styles.noteCard}>
                    <View style={styles.noteTopRow}>
                      <View style={styles.catBadge}>
                        <AppText variant="caption" color={currentTheme.primary} style={{ fontWeight: '700' }}>
                          {note.category}
                        </AppText>
                      </View>
                      <View style={styles.noteActionRow}>
                        <TouchableOpacity onPress={() => dispatch(toggleLoanNotePinned(note.id))} style={styles.iconBtn}>
                          <AppIcon icon={Pin} size={18} color={currentTheme.textMuted} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleOpenEditModal(note)} style={styles.iconBtn}>
                          <AppIcon icon={Edit3} size={18} color={currentTheme.textMuted} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteNote(note.id)} style={styles.iconBtn}>
                          <AppIcon icon={Trash2} size={18} color={currentTheme.error} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <AppText variant="cardTitle" style={{ marginBottom: 4 }}>{note.title}</AppText>
                    {note.body ? (
                      <AppText variant="bodySmall" color={currentTheme.textSecondary} style={{ marginBottom: 8 }}>
                        {note.body}
                      </AppText>
                    ) : null}
                    <AppText variant="caption" color={currentTheme.textMuted}>{formatLoanDate(note.createdAt)}</AppText>
                  </AppCard>
                ))}
              </View>
            )}
          </View>
        ) : (
          <AppCard style={styles.emptyCard}>
            <AppIcon icon={BookOpen} size={32} color={currentTheme.textMuted} style={{ marginBottom: 8 }} />
            <AppText variant="bodyMedium" style={{ fontWeight: '700', marginBottom: 4 }}>No Notes Found</AppText>
            <AppText variant="bodySmall" color={currentTheme.textMuted} style={{ textAlign: 'center', marginBottom: 12 }}>
              Keep important loan references, payment notes, or bank reminders together.
            </AppText>
            <PrimaryButton title="Create First Note" icon={Plus} onPress={handleOpenAddModal} />
          </AppCard>
        )}
      </View>

      {/* Note Form Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <AppCard style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="cardTitle">{editingNoteId ? 'Edit Note' : 'Add Note'}</AppText>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <AppIcon icon={X} size={22} color={currentTheme.textMuted} />
              </TouchableOpacity>
            </View>

            <TextInputField label="Note Title" value={title} onChangeText={setTitle} placeholder="e.g. Rate revision letter" />
            <SelectField label="Category" value={category} onValueChange={setCategory} options={CATEGORY_OPTIONS} />
            <TextInputField label="Note Body" value={body} onChangeText={setBody} multiline numberOfLines={4} placeholder="Add details..." />

            <View style={styles.modalActions}>
              <SecondaryButton title="Cancel" onPress={() => setIsModalOpen(false)} />
              <PrimaryButton title="Save Note" icon={Save} onPress={handleSaveNote} />
            </View>
          </AppCard>
        </View>
      </Modal>
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
  topControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInputText: {
    flex: 1,
    fontSize: 14,
    height: '100%',
    paddingVertical: 0,
  },
  addBtnInline: {
    height: 46,
    paddingHorizontal: 14,
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  notesListGroup: {
    gap: 14,
  },
  sectionBlock: {
    gap: 10,
  },
  noteCard: {
    padding: 14,
  },
  noteTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  catBadge: {
    backgroundColor: '#2563EB15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  noteActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 2,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    padding: 20,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
});

export default LoanNotesScreen;
