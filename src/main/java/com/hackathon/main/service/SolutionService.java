package com.hackathon.main.service;

import com.hackathon.main.model.LeaderboardEntry;
import com.hackathon.main.model.Solution;
import com.hackathon.main.model.TaskFile;
import com.hackathon.main.repository.LeaderboardRepository;
import com.hackathon.main.repository.SolutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SolutionService {

    private final SolutionRepository solutionRepository;
    private final LeaderboardRepository leaderboardRepository;
    private final ScoringService scoringService;

    /**
     * NOWA LOGIKA SUBMIT (Architektura Dwumodelowa):
     * 1. Zapisuje submisję do logu (Solution).
     * 2. Aktualizuje wpis w LeaderboardEntry (jeśli jest lepszy).
     */
    @Transactional // Zapewnia spójność obu operacji
    public Solution submitSolution(String userId, String taskId, MultipartFile file) throws IOException {

        // Krok 1: Przetwórz plik
        TaskFile solutionFile = processFile(file);

        // Krok 2: Oceń rozwiązanie
        int newScore = scoringService.calculateScore(taskId, file);
        Instant newTimestamp = Instant.now();

        // Krok 3: Stwórz i zapisz log audytowy (zawsze)
        Solution newLogEntry = new Solution();
        newLogEntry.setUserId(userId);
        newLogEntry.setTaskId(taskId);
        newLogEntry.setScore(newScore);
        newLogEntry.setSubmissionTimestamp(newTimestamp);
        newLogEntry.setFile(solutionFile);
        solutionRepository.save(newLogEntry); // Zapisz log

        // Krok 4: Zaktualizuj Leaderboard
        updateLeaderboard(userId, taskId, newScore, newTimestamp);

        return newLogEntry; // Zwróć log, który właśnie został utworzony
    }

    /**
     * Prywatna metoda, która implementuje logikę "best score" w bazie.
     * Zgodna z "tie-breaker" z eng-task (1).docx.
     */
    private void updateLeaderboard(String userId, String taskId, int newScore, Instant newTimestamp) {

        Optional<LeaderboardEntry> entryOpt = leaderboardRepository.findByUserIdAndTaskId(userId, taskId);

        if (entryOpt.isEmpty()) {
            // Pierwsza submisja tego usera: stwórz nowy wpis
            LeaderboardEntry newBest = new LeaderboardEntry(userId, taskId, newScore, newTimestamp);
            leaderboardRepository.save(newBest);
        } else {
            // User ma już jakiś wynik: porównaj
            LeaderboardEntry existingBest = entryOpt.get();

            // Logika "tie-breaker"
            boolean isNewScoreBetter = newScore > existingBest.getBestScore();
            boolean isTieAndFaster = (newScore == existingBest.getBestScore()) &&
                    (newTimestamp.isBefore(existingBest.getBestScoreTimestamp()));

            if (isNewScoreBetter || isTieAndFaster) {
                // Nowy wynik jest lepszy LUB jest remisem, ale jest szybszy
                existingBest.setBestScore(newScore);
                existingBest.setBestScoreTimestamp(newTimestamp);
                leaderboardRepository.save(existingBest); // Zaktualizuj wpis
            }
            // Jeśli nie jest lepszy, nic nie rób (zachowaj stary wpis)
        }
    }

    /**
     * NOWA LOGIKA LEADERBOARDU (Błyskawiczna):
     * Po prostu odczytuje już obliczone najlepsze wyniki z kolekcji 'leaderboard'.
     */
    public List<LeaderboardEntry> getLeaderboardForTask(String taskId) {
        // Tworzymy sortowanie (zgodne z tie-breaker)
        Sort sort = Sort.by(
                Sort.Order.desc("bestScore"),
                Sort.Order.asc("bestScoreTimestamp")
        );

        return leaderboardRepository.findByTaskId(taskId, sort);
    }

    // --- Metody pomocnicze (bez zmian) ---

    private TaskFile processFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Error: No file submitted!");
        }
        TaskFile tf = new TaskFile();
        tf.setFileName(file.getOriginalFilename());
        tf.setContentType(file.getContentType());
        String base64 = Base64.getEncoder().encodeToString(file.getBytes());
        tf.setDataBase64(base64);
        return tf;
    }

    public void deleteSolution(String id) {
        // TODO: W przyszłości usunięcie logu Solution powinno
        // triggerować przeliczenie leaderboardu dla danego usera.
        // Na hackathonie jest to wystarczające.
        if (!solutionRepository.existsById(id)) {
            throw new RuntimeException("Error: Solution not found with id: " + id);
        }
        solutionRepository.deleteById(id);
    }

    public List<Solution> getAllSolutions() {
        return solutionRepository.findAll();
    }

    // Zwraca całą historię submisji (log) dla usera
    public List<Solution> getSolutionsForUser(String userId) {
        return solutionRepository.findByUserId(userId);
    }

    // Zwraca całą historię submisji (log) dla zadania
    public List<Solution> getSolutionsForTask(String taskId) {
        return solutionRepository.findByTaskId(taskId);
    }
    public Map<String, List<Solution>> getGroupedSolutionsForUser(String userId) {
        // 1. Pobierz płaską listę wszystkich submisji usera
        List<Solution> allUserSolutions = solutionRepository.findByUserId(userId);

        // 2. Sortujemy malejąco - od najnowszej do najstarszej
        allUserSolutions.sort(Comparator.comparing(Solution::getSubmissionTimestamp).reversed());

        // 3. Grupuj po TaskId
        return allUserSolutions.stream()
                .collect(Collectors.groupingBy(Solution::getTaskId));
    }
}