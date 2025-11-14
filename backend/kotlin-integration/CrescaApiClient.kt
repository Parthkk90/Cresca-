// Kotlin API Client for Close Position
package com.aptpays.cresca.api

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

/**
 * API Client for Cresca Protocol Backend
 * Live API: https://cresca.netlify.app/api/close-position
 */
class CrescaApiClient(
    private val baseUrl: String = "https://cresca.netlify.app/api"
) {
    
    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()
    
    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    }
    
    /**
     * Close a position with protocol co-signing
     * @param positionId The ID of the position to close
     * @param userAddress The user's wallet address
     * @return ClosePositionResponse with raw transaction and protocol signature
     */
    suspend fun closePosition(
        positionId: Long,
        userAddress: String
    ): Result<ClosePositionResponse> = withContext(Dispatchers.IO) {
        try {
            val request = ClosePositionRequest(
                positionId = positionId.toString(),
                userAddress = userAddress
            )
            
            val requestBody = json.encodeToString(
                ClosePositionRequest.serializer(),
                request
            ).toRequestBody("application/json".toMediaType())
            
            val httpRequest = Request.Builder()
                .url("$baseUrl/close-position")
                .post(requestBody)
                .build()
            
            val response = client.newCall(httpRequest).execute()
            
            if (!response.isSuccessful) {
                val errorBody = response.body?.string() ?: "Unknown error"
                return@withContext Result.failure(
                    Exception("API Error ${response.code}: $errorBody")
                )
            }
            
            val responseBody = response.body?.string() 
                ?: return@withContext Result.failure(Exception("Empty response"))
            
            val apiResponse = json.decodeFromString<ClosePositionResponse>(responseBody)
            
            Result.success(apiResponse)
            
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

/**
 * Request model for close position API
 */
@Serializable
data class ClosePositionRequest(
    val positionId: String,
    val userAddress: String
)

/**
 * Response model from close position API
 */
@Serializable
data class ClosePositionResponse(
    val success: Boolean,
    val rawTransaction: String,
    val protocolSignature: ProtocolSignature,
    val protocolAddress: String
)

@Serializable
data class ProtocolSignature(
    val public_key: String,
    val signature: String
)
