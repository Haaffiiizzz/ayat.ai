import { Text, TextInput, ScrollView, StyleSheet, Button, View} from "react-native";
import { keywordSearch, embeddingSearch } from "@/utils/helper";
import React , { useState, useEffect } from "react";
import Highlighted from "@/utils/highlighted";

type verseDetails = {
  "SurahNumber": number, "VerseNumber": number, "VerseWithHarakat": string, "VerseEnglish": string
}



export default function Search () {
    const [keyword, onChangeKeyword] = useState('');
    const [searchResult, setSearchResult] = useState<Array<any> | null>([])
    const [numResults, setNumResults] = useState<number | null>(0)
    const [displayedResults, setDisplayedResults] = useState<Array<any> | null>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    

    const getSearchFromKeyword = async (keyword: string) => {
        setIsLoading(true)
        const result = await embeddingSearch(keyword); //from @utils/helper
        setIsLoading(false)
        setSearchResult(result)
        const resultLength = result ? result.length : 0;
        
        const newNumResults = resultLength >= 10 ? 10 : resultLength
        setNumResults(newNumResults)
    }

    useEffect( 
      () => {
        const newDisplayedResults = searchResult ? searchResult.slice(0, Number(numResults)) : null
        setDisplayedResults(newDisplayedResults)
      }, [searchResult, numResults]
    )


    return (
        <ScrollView style={styles.container} contentContainerStyle={{alignItems: "center"}}>
            <TextInput
                style={styles.textInput}
                onChangeText={onChangeKeyword}
                value={keyword}
                placeholder="Enter Search Keyword!"
            />
            <Button
              title="Submit" 
              onPress={ async () => { getSearchFromKeyword(keyword)
              }} 
            />

            {isLoading && <Text>Loading...</Text>}

            {
              searchResult === null && <Text>No results found!</Text>
            }

            {searchResult && searchResult.length > 0 && (
                <View style={styles.resultsInfo}>
                    <Text style={styles.resultsLabel}>Number of results</Text>
                    <Text style={styles.resultsValue}>{searchResult.length}</Text>
                </View>
            )}

            { displayedResults && displayedResults.length > 0 &&
                displayedResults.map((verse: verseDetails, index) => {
                    return (
                        <View key={index} style={styles.responseCard}>
                            <View style={styles.responseRow}>
                                <Text style={styles.responseLabel}>Surah</Text>
                                <Text style={styles.responseValue}>{verse.SurahNumber}</Text>
                            </View>
                
                            <View style={styles.divider} />
                
                            <View style={styles.responseRow}>
                                <Text style={styles.responseLabel}>Ayah</Text>
                                <Text style={styles.responseValue}>{verse.VerseNumber}</Text>
                            </View>
                
                            <View style={styles.divider} />
                
                            <View style={styles.responseRow}>
                                <Text style={styles.responseLabel}>Verse</Text>
                                <Text style={styles.arabicText}>{verse.VerseWithHarakat}</Text>
                            </View>
                
                            <View style={styles.divider} />
                
                            <View style={styles.responseRow}>
                                <Text style={styles.responseLabel}>Translation</Text>
                                <Highlighted text={verse.VerseEnglish} query={keyword} />
                            </View>
                        </View>
                    )
                })
            }

            { numResults < searchResult?.length &&
              <Button
                  title="Show More Results" 
                  onPress={ async () => { setNumResults(numResults + 10)
                  }} 
            /> }
              

            
        </ScrollView>
        
    )
}

const styles = StyleSheet.create({
    container: {
        

    },
    textInput: {
        backgroundColor: '#555',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        width: 300,
        color: 'white',
        marginBottom: 20,
    },

    responseCard: {
    width: '90%',
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eaeaea',
    backgroundColor: '#f9f9f9',
  },

  responseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },

  responseLabel: {
    width: 90,              // fixed label column
    fontSize: 14,
    color: '#6b7280',
    paddingTop: 2,
  },

  responseValue: {
    flex: 1,                // value takes remaining space
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
},

  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 6,
  },

  arabicText: {
    fontSize: 20,
    writingDirection: 'rtl',
    textAlign: 'right',
    lineHeight: 28,
    marginTop: 8,
    flex: 1,
  },

  resultsInfo: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  borderColor: '#eaeaea',
backgroundColor: '#f9f9f9',  // light gray
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 8,
  marginTop: 16,
  width: "90%",
},

resultsLabel: {
  fontSize: 14,
  color: "#6b7280",            // muted gray
  fontWeight: "500",
},

resultsValue: {
  fontSize: 16,
  fontWeight: "700",
  color: "#111827",            // dark text
},


});