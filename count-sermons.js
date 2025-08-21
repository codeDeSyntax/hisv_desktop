const { loadAudioSermons, loadEarlySermons, loadSecondSet, loadThirdSet, loadFourthSet, loadLastSet } = require('./importhelpers');

async function countSermons() {
  try {
    let totalCount = 0;
    console.log('Counting sermons...');
    
    const audio = await loadAudioSermons();
    const audioSermons = audio.default || audio;
    console.log('Audio sermons:', audioSermons.length);
    totalCount += audioSermons.length;
    
    const early = await loadEarlySermons();
    const earlySermons = early.default || early;
    console.log('Early sermons (1964-1969):', earlySermons.length);
    totalCount += earlySermons.length;
    
    const second = await loadSecondSet();
    const secondSermons = second.default || second;
    console.log('1970 sermons:', secondSermons.length);
    totalCount += secondSermons.length;
    
    const third = await loadThirdSet();
    const thirdSermons = third.default || third;
    console.log('1971 sermons:', thirdSermons.length);
    totalCount += thirdSermons.length;
    
    const fourth = await loadFourthSet();
    const fourthSermons = fourth.default || fourth;
    console.log('1972 sermons:', fourthSermons.length);
    totalCount += fourthSermons.length;
    
    const last = await loadLastSet();
    const lastSermons = last.default || last;
    console.log('1973 sermons:', lastSermons.length);
    totalCount += lastSermons.length;
    
    console.log('TOTAL SERMONS:', totalCount);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

countSermons();
