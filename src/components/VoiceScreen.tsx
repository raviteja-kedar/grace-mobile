import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
} from '@react-native-voice/voice';
import {THEME} from '../styles/theme';
import {Button, Spinner} from './common';

interface VoiceScreenProps {
  onClose: () => void;
}

const VoiceScreen: React.FC<VoiceScreenProps> = ({onClose}) => {
  const [isListening, setIsListening] = useState(false);
  const [recognized, setRecognized] = useState('');
  const [error, setError] = useState('');
  const [end, setEnd] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [partialResults, setPartialResults] = useState<string[]>([]);

  useEffect(() => {
    // Initialize voice
    function onSpeechStart(): void {
      console.log('onSpeechStart');
      setRecognized('');
      setError('');
      setEnd('');
      setResults([]);
      setPartialResults([]);
    }

    function onSpeechRecognized(): void {
      setRecognized('✓');
    }

    function onSpeechEnd(): void {
      setIsListening(false);
      setEnd('√');
    }

    function onSpeechError(e: SpeechErrorEvent): void {
      console.log('onSpeechError', e);
      setError(JSON.stringify(e.error));
      setIsListening(false);
    }

    function onSpeechResults(e: SpeechResultsEvent): void {
      console.log('onSpeechResults', e);
      if (e.value) {
        setResults(e.value);
      }
    }

    function onSpeechPartialResults(e: SpeechResultsEvent): void {
      console.log('onSpeechPartialResults', e);
      if (e.value) {
        setPartialResults(e.value);
      }
    }

    function onSpeechVolumeChanged(): void {
      // You can implement volume visualization here if needed
    }

    // Add event listeners
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechRecognized = onSpeechRecognized;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    Voice.onSpeechVolumeChanged = onSpeechVolumeChanged;

    // Cleanup
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    try {
      setIsListening(true);
      await Voice.start('en-US');
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.error(e);
    }
  };

  const cancelListening = async () => {
    try {
      await Voice.cancel();
      setIsListening(false);
    } catch (e) {
      console.error(e);
    }
  };

  const clearResults = () => {
    setResults([]);
    setPartialResults([]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice Recognition</Text>
        <Button
          title="Close"
          onPress={onClose}
          variant="outline"
          size="small"
          style={styles.closeButton}
          textStyle={styles.closeButtonText}
        />
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {isListening ? 'Listening...' : 'Not Listening'}
        </Text>
        {isListening && <Spinner />}
      </View>

      <ScrollView style={styles.resultsContainer}>
        <Text style={styles.sectionTitle}>Results:</Text>
        {results.map((result, index) => (
          <Text key={`result-${index}`} style={styles.resultText}>
            {result}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>Partial Results:</Text>
        {partialResults.map((result, index) => (
          <Text key={`partial-${index}`} style={styles.partialResultText}>
            {result}
          </Text>
        ))}

        {error !== '' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Error:</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.circleButton,
            isListening ? styles.stopButton : styles.startButton,
          ]}
          onPress={isListening ? stopListening : startListening}>
          <Text style={styles.buttonText}>
            {isListening ? 'Stop' : 'Start'}
          </Text>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <Button
            title="Cancel"
            onPress={cancelListening}
            variant="outline"
            size="medium"
            disabled={!isListening}
            style={styles.actionButton}
          />
          <Button
            title="Clear"
            onPress={clearResults}
            variant="secondary"
            size="medium"
            style={styles.actionButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.l,
  },
  title: {
    fontSize: THEME.typography.title.fontSize,
    fontWeight: THEME.typography.title.fontWeight as 'bold',
    color: THEME.colors.primary,
  },
  closeButton: {
    borderWidth: 1,
    borderColor: THEME.colors.secondary,
  },
  closeButtonText: {
    color: THEME.colors.textTertiary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.l,
    padding: THEME.spacing.m,
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.radius.m,
  },
  statusText: {
    fontSize: THEME.typography.subtitle.fontSize,
    fontWeight: THEME.typography.subtitle.fontWeight as '600',
    color: THEME.colors.textSecondary,
    marginRight: THEME.spacing.m,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.radius.m,
    padding: THEME.spacing.m,
    marginBottom: THEME.spacing.m,
  },
  sectionTitle: {
    fontSize: THEME.typography.subtitle.fontSize,
    fontWeight: THEME.typography.subtitle.fontWeight as '600',
    color: THEME.colors.primary,
    marginTop: THEME.spacing.m,
    marginBottom: THEME.spacing.s,
  },
  resultText: {
    fontSize: THEME.typography.body.fontSize,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.s,
    padding: THEME.spacing.s,
    backgroundColor: 'rgba(139, 195, 74, 0.1)',
    borderRadius: THEME.radius.s,
  },
  partialResultText: {
    fontSize: THEME.typography.body.fontSize,
    color: THEME.colors.textTertiary,
    fontStyle: 'italic',
    marginBottom: THEME.spacing.s,
  },
  errorContainer: {
    marginTop: THEME.spacing.m,
    padding: THEME.spacing.m,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: THEME.radius.m,
  },
  errorTitle: {
    fontSize: THEME.typography.subtitle.fontSize,
    fontWeight: THEME.typography.subtitle.fontWeight as '600',
    color: THEME.colors.error,
    marginBottom: THEME.spacing.s,
  },
  errorText: {
    fontSize: THEME.typography.body.fontSize,
    color: THEME.colors.error,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: THEME.spacing.m,
  },
  circleButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: THEME.spacing.l,
  },
  startButton: {
    backgroundColor: THEME.colors.primary,
  },
  stopButton: {
    backgroundColor: THEME.colors.error,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: THEME.typography.button.fontSize,
    fontWeight: THEME.typography.button.fontWeight as '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  actionButton: {
    minWidth: 120,
  },
});

export default VoiceScreen;
