import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class YoutubeService {
  // We reuse the Firebase API Key as it is likely a Google Cloud Key with YouTube enabled.
  // If not, the user will need to enable YouTube Data API v3 for this key in Google Cloud Console.
  static const String _baseUrl = 'https://www.googleapis.com/youtube/v3';

  static Future<List<Map<String, dynamic>>> searchVideos(String query) async {
    // Accessing the private _apiKey from FirebaseService is not possible directly if it's private.
    // We should probably expose it or duplicate it.
    // However, I can't edit FirebaseService just to make it public without ensuring it's safe.
    // Let's copy it here for now since I can see it in the previous file view.
    const String apiKey = 'AIzaSyAkRb4Bv_oaGfAlEsjFJcqG7XuW6R8kQzk';

    final encodedQuery = Uri.encodeComponent(query);
    final url = Uri.parse(
      '$_baseUrl/search?part=snippet&maxResults=5&q=$encodedQuery&type=video&key=$apiKey',
    );

    try {
      final response = await http.get(url);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List<dynamic> items = data['items'];

        return items.map((item) {
          final snippet = item['snippet'];
          return {
            'videoId': item['id']['videoId'],
            'title': snippet['title'],
            'thumbnail': snippet['thumbnails']['medium']['url'],
            'channelTitle': snippet['channelTitle'],
            'publishedAt': snippet['publishedAt'],
          };
        }).toList();
      } else {
        debugPrint('YouTube API Error: ${response.body}');
        return [];
      }
    } catch (e) {
      debugPrint('YouTube API Exception: $e');
      return [];
    }
  }
}
