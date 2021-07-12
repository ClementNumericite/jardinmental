import React, {useEffect, useState} from 'react';
import {View, StyleSheet, TextInput, Platform} from 'react-native';

import styleBeck from '../../styles/beck';
import Text from '../../components/MyText';
import Button from '../../components/Button';
import Separator from '../../components/Separator';
import DiscretSlider from '../../components/DiscretSlider';
import logEvents from '../../services/logEvents';

export default ({onChange, onSubmit, data}) => {
  const numberOfLines = 8;
  const [trustInThoughsNowSelected, setTrustInThoughsNowSelected] = useState();
  const [
    mainEmotionIntensityNuancedSelected,
    setMainEmotionIntensityNuancedSelected,
  ] = useState();
  const [argumentProsSelected, setArgumentProsSelected] = useState();
  const [argumentConsSelected, setArgumentConsSelected] = useState();
  const [nuancedThoughtsSelected, setNuancedThoughtsSelected] = useState();

  useEffect(() => {
    logEvents.logBeckStepOpen(5);
  }, []);

  useEffect(() => {
    setArgumentProsSelected(data?.argumentPros);
    setArgumentConsSelected(data?.argumentCons);
    setNuancedThoughtsSelected(data?.nuancedThoughts);
    setTrustInThoughsNowSelected(data?.trustInThoughsNow);
    setMainEmotionIntensityNuancedSelected(data?.mainEmotionIntensityNuanced);
  }, [data]);

  return (
    <View style={styles.safe}>
      <Text style={styleBeck.title}>Arguments en faveur de votre pensée</Text>
      <Text style={styleBeck.subtitle}>
        Quels sont les arguments qui accréditent votre pensée initiale ?
      </Text>
      <TextInput
        multiline={true}
        numberOfLines={Platform.OS === 'ios' ? null : numberOfLines}
        minHeight={Platform.OS === 'ios' ? 20 * numberOfLines : null}
        onChangeText={(argumentPros) => onChange({argumentPros})}
        value={argumentProsSelected}
        placeholder="Message..."
        style={styleBeck.textArea}
      />
      <Text style={styleBeck.title}>Arguments en défaveur de votre pensée</Text>
      <Text style={styleBeck.subtitle}>
        Quels sont les arguments qui nuancent/démentent votre pensée initiale{' '}
      </Text>
      <TextInput
        multiline={true}
        numberOfLines={Platform.OS === 'ios' ? null : numberOfLines}
        minHeight={Platform.OS === 'ios' ? 20 * numberOfLines : null}
        onChangeText={(argumentCons) => onChange({argumentCons})}
        value={argumentConsSelected}
        placeholder="Message..."
        style={styleBeck.textArea}
      />
      <Text style={styleBeck.title}>Pensée plus nuancée/adaptée</Text>
      <Text style={styleBeck.subtitle}>
        En prenant en compte à la fois les arguments en faveur et en défaveur de
        la pensée initiale
      </Text>
      <TextInput
        multiline={true}
        numberOfLines={Platform.OS === 'ios' ? null : numberOfLines}
        minHeight={Platform.OS === 'ios' ? 20 * numberOfLines : null}
        onChangeText={(nuancedThoughts) => onChange({nuancedThoughts})}
        value={nuancedThoughtsSelected}
        placeholder="Message..."
        style={styleBeck.textArea}
      />
      <Separator style={styleBeck.separator} />
      <Text style={styleBeck.title}>
        A quel % je crois à ma pensée initiale maintenant
      </Text>
      <DiscretSlider
        step={trustInThoughsNowSelected}
        onChange={(trustInThoughsNow) => {
          setTrustInThoughsNowSelected(trustInThoughsNow);
          onChange({trustInThoughsNow});
        }}
      />
      <View style={styleBeck.separator} />
      <Text style={styleBeck.title}>
        Vos émotions et leur % d'intensité maintenant en ayant la pensée nuancée
        en tête
      </Text>
      <DiscretSlider
        step={mainEmotionIntensityNuancedSelected}
        onChange={(mainEmotionIntensityNuanced) => {
          setMainEmotionIntensityNuancedSelected(mainEmotionIntensityNuanced);
          onChange({mainEmotionIntensityNuanced});
        }}
      />
      <Button
        title="Terminer"
        buttonStyle={styleBeck.submitButton}
        onPress={onSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'white',
  },
});
