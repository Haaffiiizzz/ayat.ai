import { Text, TextInput, ScrollView, StyleSheet, Button, View, ActivityIndicator } from "react-native";
import { keywordSearch, embeddingSearch } from "@/utils/helper";
import React , { useState, useEffect } from "react";
import VerseResult from "@/components/VerseResult";
import { useFonts } from "expo-font";

type verseDetails = {
  "SurahNumber": number, "VerseNumber": number, "VerseWithHarakat": string, "VerseEnglish": string, "VerseIndex": number
}

export default function Search () {
    const [keyword, onChangeKeyword] = useState('');
    const [searchResult, setSearchResult] = useState<Array<any> | null>([])
    const [numResults, setNumResults] = useState<number | null>(0)
    const [displayedResults, setDisplayedResults] = useState<Array<any> | null>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const [fontsLoaded] = useFonts({
      Uthmanic: require("../../assets/fonts/UthmanTN_v2-0.ttf"),
    });
    
    

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
                placeholder="Enter search keyword"
                placeholderTextColor="#9CA3AF"
                returnKeyType="search"
                onSubmitEditing={() => getSearchFromKeyword(keyword)}
            />
            <View style={{ width: '90%', marginBottom: 12 }}>
              <Button
                title={isLoading ? "Searching..." : "Search"}
                onPress={async () => { getSearchFromKeyword(keyword) }}
                disabled={isLoading || !keyword.trim()}
              />
            </View>

            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Finding relevant verses...</Text>
              </View>
            )}

            {
              searchResult === null && <Text>No results found!</Text>
            }

            {searchResult && searchResult.length > 0 && (
                <View style={styles.resultsInfo}>
                    <Text style={styles.resultsLabel}>Results</Text>
                    <Text style={styles.resultsValue}>
                      {Math.min(Number(numResults) || 0, searchResult.length)} / {searchResult.length}
                    </Text>
                </View>
            )}

            {displayedResults && displayedResults.length > 0 &&
              displayedResults.map((verse: verseDetails, index) => (
                <VerseResult key={index} verse={verse} keyword={keyword} />
              ))
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
      flex: 1,
      backgroundColor: '#fff',
    },
    textInput: {
        backgroundColor: '#ffffff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        width: '90%',
        color: '#111827',
        marginTop: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
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
    fontSize: 24,
    writingDirection: 'rtl',
    textAlign: 'right',
    lineHeight: 30,
    marginTop: 8,
    flex: 1,
    fontFamily: "Uthmanic"
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

  loadingContainer: {
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    fontStyle: 'italic',
  },


});
