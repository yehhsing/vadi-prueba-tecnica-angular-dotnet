USE GestionProyectos;
GO

-- ============================================================
-- Proyectos
-- ============================================================

CREATE OR ALTER PROCEDURE sp_ListarProyectosPaginado
    @Pagina INT = 1,
    @TamanoPagina INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    IF @Pagina < 1 SET @Pagina = 1;
    IF @TamanoPagina < 1 SET @TamanoPagina = 10;

    DECLARE @Offset INT = (@Pagina - 1) * @TamanoPagina;

    SELECT
        p.Id,
        p.Nombre,
        p.Descripcion,
        p.FechaInicio,
        p.FechaFin,
        p.EstadoId,
        e.Nombre AS EstadoNombre,
        p.CreadoPorId,
        u.Nombre AS CreadoPorNombre,
        p.FechaCreacion
    FROM Proyectos p
    INNER JOIN Estados e ON e.Id = p.EstadoId
    INNER JOIN Usuarios u ON u.Id = p.CreadoPorId
    ORDER BY p.Id
    OFFSET @Offset ROWS
    FETCH NEXT @TamanoPagina ROWS ONLY;

    SELECT COUNT(1) AS TotalRegistros
    FROM Proyectos;
END
GO

CREATE OR ALTER PROCEDURE sp_ObtenerProyectoPorId
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.Id,
        p.Nombre,
        p.Descripcion,
        p.FechaInicio,
        p.FechaFin,
        p.EstadoId,
        e.Nombre AS EstadoNombre,
        p.CreadoPorId,
        u.Nombre AS CreadoPorNombre,
        p.FechaCreacion
    FROM Proyectos p
    INNER JOIN Estados e ON e.Id = p.EstadoId
    INNER JOIN Usuarios u ON u.Id = p.CreadoPorId
    WHERE p.Id = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_InsertarProyecto
    @Nombre NVARCHAR(150),
    @Descripcion NVARCHAR(500) = NULL,
    @FechaInicio DATE,
    @FechaFin DATE,
    @EstadoId INT,
    @CreadoPorId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF @FechaFin < @FechaInicio
    BEGIN
        RAISERROR('La fecha fin debe ser mayor o igual a la fecha inicio.', 16, 1);
        RETURN;
    END

    INSERT INTO Proyectos (
        Nombre,
        Descripcion,
        FechaInicio,
        FechaFin,
        EstadoId,
        CreadoPorId
    )
    OUTPUT INSERTED.Id
    VALUES (
        @Nombre,
        @Descripcion,
        @FechaInicio,
        @FechaFin,
        @EstadoId,
        @CreadoPorId
    );
END
GO

CREATE OR ALTER PROCEDURE sp_ActualizarProyecto
    @Id INT,
    @Nombre NVARCHAR(150),
    @Descripcion NVARCHAR(500) = NULL,
    @FechaInicio DATE,
    @FechaFin DATE,
    @EstadoId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Proyectos WHERE Id = @Id)
    BEGIN
        RAISERROR('Proyecto no encontrado.', 16, 1);
        RETURN;
    END

    IF @FechaFin < @FechaInicio
    BEGIN
        RAISERROR('La fecha fin debe ser mayor o igual a la fecha inicio.', 16, 1);
        RETURN;
    END

    IF EXISTS (
        SELECT 1
        FROM Estados
        WHERE Id = @EstadoId
          AND Nombre = 'Completada'
    )
    AND EXISTS (
        SELECT 1
        FROM Tareas t
        INNER JOIN Estados e ON e.Id = t.EstadoId
        WHERE t.ProyectoId = @Id
          AND e.Nombre NOT IN ('Completada', 'Cancelada')
    )
    BEGIN
        RAISERROR('No se puede completar un proyecto con tareas pendientes o en progreso.', 16, 1);
        RETURN;
    END

    UPDATE Proyectos
    SET
        Nombre = @Nombre,
        Descripcion = @Descripcion,
        FechaInicio = @FechaInicio,
        FechaFin = @FechaFin,
        EstadoId = @EstadoId
    WHERE Id = @Id;
END
GO

CREATE OR ALTER PROCEDURE sp_EliminarProyecto
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Proyectos WHERE Id = @Id)
    BEGIN
        RAISERROR('Proyecto no encontrado.', 16, 1);
        RETURN;
    END

    IF EXISTS (
        SELECT 1
        FROM Tareas t
        INNER JOIN Estados e ON e.Id = t.EstadoId
        WHERE t.ProyectoId = @Id
          AND e.Nombre IN ('Pendiente', 'En Progreso')
    )
    BEGIN
        RAISERROR('No se puede eliminar un proyecto con tareas pendientes o en progreso.', 16, 1);
        RETURN;
    END

    BEGIN TRY
        BEGIN TRANSACTION;

        DELETE FROM Tareas
        WHERE ProyectoId = @Id;

        DELETE FROM Proyectos
        WHERE Id = @Id;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE sp_ProyectoTieneTareasPendientesOEnProgreso
    @ProyectoId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CAST(
        CASE WHEN EXISTS (
            SELECT 1
            FROM Tareas t
            INNER JOIN Estados e ON e.Id = t.EstadoId
            WHERE t.ProyectoId = @ProyectoId
              AND e.Nombre IN ('Pendiente', 'En Progreso')
        )
        THEN 1 ELSE 0 END
    AS BIT) AS TieneTareas;
END
GO

CREATE OR ALTER PROCEDURE sp_ProyectoTieneTareasNoFinalizadas
    @ProyectoId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CAST(
        CASE WHEN EXISTS (
            SELECT 1
            FROM Tareas t
            INNER JOIN Estados e ON e.Id = t.EstadoId
            WHERE t.ProyectoId = @ProyectoId
              AND e.Nombre NOT IN ('Completada', 'Cancelada')
        )
        THEN 1 ELSE 0 END
    AS BIT) AS TieneTareas;
END
GO
